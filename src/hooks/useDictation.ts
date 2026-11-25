"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site";
import { gsap } from "@/lib/gsap";
import {
  byteRmsLevel,
  DICTATION_CONFIRM_WAIT_MS,
  DICTATION_EMPTY_SESSION_MS,
  DICTATION_MAX_EMPTY_RESTARTS,
  DICTATION_SOUND_LEVEL,
  dictationStopReason,
  readRecognitionText,
  smoothLevel,
} from "@/lib/assistant/dictation";

/*
 * Dictation for the shopping assistant: the browser's own speech recognition (continuous, with interim
 * results, in the site's language) and a microphone level meter for the waveform and the orb. On
 * Android the recogniser and the meter can't share the microphone, so the level follows the
 * recogniser's events instead. Safari keeps one utterance open, so it's stopped after each final
 * result and started again.
 */

/** The slice of the Web Speech API used here (TypeScript's DOM types carry its events, not the class) */
interface Recognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onsoundstart: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type RecognitionClass = new () => Recognition;

/** Shown when the browser or the shopper refuses the microphone */
const BLOCKED_MESSAGE = "Microphone access was blocked.";

/** Set once the microphone has been refused: the mic button stays hidden until a reload */
let microphoneBlocked = false;

const recognitionClass = (): RecognitionClass | null => {
  if (typeof window === "undefined") return null;
  const speech = window as Window & {
    SpeechRecognition?: RecognitionClass;
    webkitSpeechRecognition?: RecognitionClass;
  };
  return speech.SpeechRecognition ?? speech.webkitSpeechRecognition ?? null;
};

/** Chrome's document.permissionsPolicy (featurePolicy before it): not in TypeScript's DOM types */
interface FeaturePolicy {
  allowsFeature: (feature: string) => boolean;
}

/** False when the page's Permissions-Policy blocks the microphone */
const microphoneAllowed = () => {
  const doc = document as Document & { permissionsPolicy?: FeaturePolicy; featurePolicy?: FeaturePolicy };
  try {
    return (doc.permissionsPolicy ?? doc.featurePolicy)?.allowsFeature("microphone") ?? true;
  } catch {
    return true;
  }
};

/** The browser can recognise speech and the page may use the microphone */
const dictationSupported = () => !microphoneBlocked && Boolean(recognitionClass()) && microphoneAllowed();

const hasFinalResult = (event: SpeechRecognitionEvent) => {
  for (let i = event.resultIndex; i < event.results.length; i++) if (event.results[i]?.isFinal) return true;
  return false;
};

// ---------- Level meters -----------------------------------------------------

interface Meter {
  start: () => Promise<void>;
  /** Android: a recogniser event bumps the level */
  kick: (amount?: number) => void;
  stop: () => void;
}

/** The microphone's level, from an analyser, smoothed every frame */
function microphoneMeter(onLevel: (level: number) => void): Meter {
  let stream: MediaStream | null = null;
  let context: AudioContext | null = null;
  let source: MediaStreamAudioSourceNode | null = null;
  let analyser: AnalyserNode | null = null;
  let bytes = new Uint8Array(0);
  let level = 0;
  let last = 0;
  let stopped = false;

  const tick = () => {
    if (!analyser) return;
    const now = performance.now();
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    analyser.getByteTimeDomainData(bytes);
    level = smoothLevel(level, byteRmsLevel(bytes), dt);
    onLevel(level);
  };

  return {
    async start() {
      const media = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      if (stopped) {
        media.getTracks().forEach((track) => track.stop());
        return;
      }
      stream = media;
      context = new AudioContext();
      if (context.state === "suspended") context.resume().catch(() => {});
      source = context.createMediaStreamSource(stream);
      analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.5;
      source.connect(analyser);
      bytes = new Uint8Array(analyser.fftSize);
      last = performance.now();
      gsap.ticker.add(tick);
    },
    kick() {},
    stop() {
      stopped = true;
      gsap.ticker.remove(tick);
      source?.disconnect();
      stream?.getTracks().forEach((track) => track.stop());
      context?.close().catch(() => {});
      stream = context = source = analyser = null;
      onLevel(0);
    },
  };
}

/** Android: a level that jumps on the recogniser's events and dies away */
function eventMeter(onLevel: (level: number) => void): Meter {
  let energy = 0;
  let level = 0;
  let last = 0;

  const tick = () => {
    const now = performance.now();
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    energy *= Math.exp(-dt / 0.35);
    level = smoothLevel(level, energy > 0.05 ? 0.06 + 0.24 * energy : 0, dt);
    onLevel(level);
  };

  return {
    async start() {
      last = performance.now();
      gsap.ticker.add(tick);
    },
    kick(amount = 0.6 + 0.4 * Math.random()) {
      energy = Math.max(energy, amount);
    },
    stop() {
      gsap.ticker.remove(tick);
      energy = level = 0;
      onLevel(0);
    },
  };
}

// ---------- Controller -------------------------------------------------------

export interface DictationOptions {
  /** The words, on Insert (or when dictation stops by itself) */
  onConfirm?: (text: string) => void;
  onError?: (message: string) => void;
  /** The microphone level (0–1), every frame while dictating */
  onLevel?: (level: number) => void;
}

interface Session {
  committed: string;
  sessionText: string;
  startedAt: number;
  lastSoundAt: number;
  sessionStartedAt: number;
  emptyRestarts: number;
  confirming: boolean;
  retryAfterEnd: boolean;
  android: boolean;
  apple: boolean;
  recognition: Recognition | null;
  meter: Meter;
  checkTimer?: number;
  confirmTimer?: number;
  restartTimer?: number;
}

/** One dictation at a time. Its state lives here, outside React; the hook mirrors what the UI needs */
function dictationController({
  options,
  setDictating,
  setSupported,
}: {
  options: () => DictationOptions;
  setDictating: (dictating: boolean) => void;
  setSupported: (supported: boolean) => void;
}) {
  let session: Session | null = null;
  let level = 0;

  const emitLevel = (value: number) => {
    level = value;
    if (session && value > DICTATION_SOUND_LEVEL) session.lastSoundAt = performance.now();
    options().onLevel?.(value);
  };

  const commitSessionText = (current: Session) => {
    const words = current.sessionText.trim();
    if (words) current.committed = current.committed ? `${current.committed} ${words}` : words;
    current.sessionText = "";
  };

  const teardown = () => {
    const current = session;
    if (!current) return;
    session = null;
    window.clearInterval(current.checkTimer);
    window.clearTimeout(current.confirmTimer);
    window.clearTimeout(current.restartTimer);
    const recognition = current.recognition;
    if (recognition) {
      recognition.onresult = recognition.onerror = null;
      recognition.onend = recognition.onsoundstart = null;
      try {
        recognition.abort();
      } catch {
        // Already ended
      }
    }
    current.meter.stop();
    level = 0;
    setDictating(false);
  };

  const finish = () => {
    const current = session;
    if (!current) return;
    commitSessionText(current);
    const text = current.committed.trim();
    teardown();
    if (text) options().onConfirm?.(text);
  };

  const confirm = () => {
    const current = session;
    if (!current || current.confirming) return;
    current.confirming = true;
    window.clearTimeout(current.restartTimer);
    // The recogniser's last words arrive on its end; this is the longest they're waited for
    current.confirmTimer = window.setTimeout(finish, DICTATION_CONFIRM_WAIT_MS);
    if (!current.recognition) return finish();
    try {
      current.recognition.stop();
    } catch {
      finish();
    }
  };

  const refuse = () => {
    microphoneBlocked = true;
    teardown();
    setSupported(false);
    options().onError?.(BLOCKED_MESSAGE);
  };

  const listen = (current: Session, isRetry = false) => {
    if (session !== current) return;
    const Recognition = recognitionClass();
    if (!Recognition) return confirm();
    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = siteConfig.language;
    current.recognition = recognition;
    current.sessionText = "";
    current.sessionStartedAt = performance.now();

    recognition.onsoundstart = () => {
      current.lastSoundAt = performance.now();
      current.meter.kick(0.4);
    };
    recognition.onresult = (event) => {
      current.sessionText = readRecognitionText(event.results, { mergeRevisions: current.android });
      current.lastSoundAt = performance.now();
      current.meter.kick();
      if (current.apple && !current.confirming && hasFinalResult(event)) {
        window.setTimeout(() => {
          try {
            recognition.stop();
          } catch {
            // Already ended
          }
        }, 0);
      }
    };
    recognition.onerror = (event) => {
      // Android may refuse the first start while the meter takes the microphone
      if (current.android && !isRetry && event.error === "not-allowed") {
        current.retryAfterEnd = true;
        return;
      }
      if (event.error === "not-allowed" || event.error === "service-not-allowed") return refuse();
      if (event.error === "network" || event.error === "audio-capture") confirm();
    };
    recognition.onend = () => {
      if (session !== current) return;
      if (current.confirming) return finish();
      if (current.retryAfterEnd) {
        current.retryAfterEnd = false;
        commitSessionText(current);
        current.restartTimer = window.setTimeout(() => listen(current, true), 250);
        return;
      }
      // The browser ends recognition by itself now and then: start again, unless it keeps ending empty
      const empty =
        !current.sessionText.trim() && performance.now() - current.sessionStartedAt < DICTATION_EMPTY_SESSION_MS;
      commitSessionText(current);
      current.emptyRestarts = empty ? current.emptyRestarts + 1 : 0;
      if (current.emptyRestarts >= DICTATION_MAX_EMPTY_RESTARTS) return finish();
      listen(current);
    };

    try {
      recognition.start();
    } catch {
      if (isRetry) return finish();
      current.restartTimer = window.setTimeout(() => listen(current, true), 250);
    }
  };

  const start = () => {
    if (session || !dictationSupported()) return;
    const now = performance.now();
    const android = /android/i.test(navigator.userAgent);
    const current: Session = {
      committed: "",
      sessionText: "",
      startedAt: now,
      lastSoundAt: now,
      sessionStartedAt: now,
      emptyRestarts: 0,
      confirming: false,
      retryAfterEnd: false,
      android,
      apple: /apple/i.test(navigator.vendor),
      recognition: null,
      meter: android ? eventMeter(emitLevel) : microphoneMeter(emitLevel),
    };
    session = current;
    setDictating(true);
    listen(current);
    // The level is decoration: the words come from the recogniser, so a meter that fails is ignored
    current.meter.start().catch(() => {});
    current.checkTimer = window.setInterval(() => {
      const reason = dictationStopReason({
        now: performance.now(),
        startedAt: current.startedAt,
        lastSoundAt: current.lastSoundAt,
      });
      if (reason) confirm();
    }, 1000);
  };

  return { start, confirm, cancel: teardown, level: () => level };
}

type Controller = ReturnType<typeof dictationController>;

/**
 * Dictation into the assistant's field. `supported` is false where the browser can't recognise speech
 * (Firefox) or the microphone is blocked; Insert (`confirm`) hands the words to `onConfirm`, and
 * dictation also stops by itself after 15 s of silence or 3 minutes. Only for client-rendered UI:
 * `supported` is read on the first render.
 */
export function useDictation(options: DictationOptions) {
  const [supported, setSupported] = useState(dictationSupported);
  const [isDictating, setIsDictating] = useState(false);
  const optionsRef = useRef(options);
  const controller = useRef<Controller | null>(null);

  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    const created = dictationController({
      options: () => optionsRef.current,
      setDictating: setIsDictating,
      setSupported,
    });
    controller.current = created;
    return () => {
      created.cancel();
      controller.current = null;
    };
  }, []);

  const start = useCallback(() => controller.current?.start(), []);
  const confirm = useCallback(() => controller.current?.confirm(), []);
  const cancel = useCallback(() => controller.current?.cancel(), []);
  const getLevel = useCallback(() => controller.current?.level() ?? 0, []);

  return { supported, isDictating, start, confirm, cancel, getLevel };
}

export type Dictation = ReturnType<typeof useDictation>;
