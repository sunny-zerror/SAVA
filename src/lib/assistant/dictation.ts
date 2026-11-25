/*
 * The shopping assistant's dictation rules and levels: when to stop listening, turning the browser's
 * recognition results into text, and the microphone levels that drive the waveform and the orb. The
 * browser parts (speech recognition, the microphone) live in src/hooks/useDictation.ts.
 */

/** Dictation never runs longer than this… */
export const DICTATION_MAX_MS = 180_000;
/** …or this long without a sound */
export const DICTATION_SILENCE_MS = 15_000;
/** Insert waits this long for the recogniser's last words */
export const DICTATION_CONFIRM_WAIT_MS = 700;
/** Recognition sessions that end empty, in a row, before dictation gives up */
export const DICTATION_MAX_EMPTY_RESTARTS = 3;
/** A recognition session this short, with no words, counts as empty */
export const DICTATION_EMPTY_SESSION_MS = 1000;
/** A level (0–1) above this counts as sound */
export const DICTATION_SOUND_LEVEL = 0.04;
/** The waveform adds a bar this often */
export const DICTATION_BAR_MS = 100;

/** "max" or "silence" once dictation should stop, else null */
export function dictationStopReason({
  now,
  startedAt,
  lastSoundAt,
}: Record<"now" | "startedAt" | "lastSoundAt", number>) {
  if (now - startedAt >= DICTATION_MAX_MS) return "max";
  if (now - lastSoundAt >= DICTATION_SILENCE_MS) return "silence";
  return null;
}

// ---------- Text -------------------------------------------------------------

const joinWords = (parts: string[]) => parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();

const extendsText = (text: string, previous?: string) =>
  Boolean(previous) && text.toLowerCase().startsWith(previous!.toLowerCase());

/**
 * The words of one recognition session: its final results in order, then the interim tail. With
 * `mergeRevisions` (Android's Chrome repeats the earlier words in each new result), a result that
 * extends the one before replaces it.
 */
export function readRecognitionText(results: SpeechRecognitionResultList, { mergeRevisions = false } = {}) {
  const finals: string[] = [];
  let interim = "";
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const text = (result[0]?.transcript ?? "").trim();
    if (!text) continue;
    if (!result.isFinal) {
      interim = joinWords([interim, text]);
    } else if (mergeRevisions && extendsText(text, finals.at(-1))) {
      finals[finals.length - 1] = text;
    } else {
      finals.push(text);
    }
  }
  if (mergeRevisions && interim && extendsText(interim, finals.at(-1))) {
    finals[finals.length - 1] = interim;
    interim = "";
  }
  return joinWords([...finals, interim]);
}

/** The field's text with the dictated words after it */
export function appendDictation(fieldText: string, dictated: string) {
  const words = dictated.trim();
  if (!words) return fieldText;
  const current = fieldText.replace(/\s+$/, "");
  return current ? `${current} ${words}` : words;
}

// ---------- Levels -----------------------------------------------------------

/** A waveform bar's height (0–1) from the loudest level heard in its slot */
export const waveBarHeight = (peak: number) => Math.min(1, Math.pow(Math.max(0, peak) * 3, 0.7));

/** Eases a level towards `target` over `dt` seconds: quickly up (`attack`), more slowly down (`release`) */
export function smoothLevel(previous: number, target: number, dt: number, attack = 0.05, release = 0.25) {
  const tau = target > previous ? attack : release;
  return previous + (target - previous) * (1 - Math.exp(-Math.max(0, dt) / tau));
}

/** RMS level (0–1) of an analyser's time-domain bytes, where 128 is silence */
export function byteRmsLevel(bytes: Uint8Array, gain = 3.2) {
  if (!bytes.length) return 0;
  let sum = 0;
  for (const byte of bytes) {
    const value = (byte - 128) / 128;
    sum += value * value;
  }
  return Math.min(1, Math.sqrt(sum / bytes.length) * gain);
}
