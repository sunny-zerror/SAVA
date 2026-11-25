"use client";

import { RiAddLine, RiSubtractLine } from "@remixicon/react";
import { useState } from "react";
import { cn } from "@/utils/cn";

interface QuantityStepperProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled?: boolean;
  max?: number;
}

// Each side fills with mist and turns SAVA blue on hover, and presses in on click
const side =
  "group/step center h-full w-9 text-ink transition-[background-color,color,scale] duration-300 ease-out-expo hover:bg-mist hover:text-accent active:scale-90 disabled:pointer-events-none disabled:opacity-40";

/**
 * − count +. The box takes a blue tint while it's hovered; the count rolls up as it rises and down as
 * it falls.
 */
export default function QuantityStepper({ value, onIncrement, onDecrement, disabled, max }: QuantityStepperProps) {
  // Which way the count last moved, for the way the new number rolls in
  const [shown, setShown] = useState(value);
  const [direction, setDirection] = useState<"up" | "down" | null>(null);
  if (value !== shown) {
    setDirection(value > shown ? "up" : "down");
    setShown(value);
  }

  return (
    <div className="inline-flex h-9 items-center border border-line transition-colors duration-300 hover:border-accent/40">
      <button onClick={onDecrement} disabled={disabled} aria-label="Decrease quantity" className={side}>
        <RiSubtractLine className="size-4 transition-transform duration-500 ease-out-expo" />
      </button>
      <span className="w-8 overflow-hidden text-center text-caption tabular-nums" aria-live="polite">
        <span
          key={value}
          className={cn(
            "block",
            direction === "up" && "animate-count-up",
            direction === "down" && "animate-count-down",
          )}
        >
          {value}
        </span>
      </span>
      <button
        onClick={onIncrement}
        disabled={disabled || (max != null && value >= max)}
        aria-label="Increase quantity"
        className={side}
      >
        <RiAddLine className="size-4 transition-transform duration-500 ease-out-expo" />
      </button>
    </div>
  );
}
