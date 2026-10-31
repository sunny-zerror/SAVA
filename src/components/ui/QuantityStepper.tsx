"use client";

import { RiAddLine, RiSubtractLine } from "@remixicon/react";

interface QuantityStepperProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled?: boolean;
  max?: number;
}

export default function QuantityStepper({ value, onIncrement, onDecrement, disabled, max }: QuantityStepperProps) {
  return (
    <div className="inline-flex h-9 items-center border border-line">
      <button
        onClick={onDecrement}
        disabled={disabled}
        aria-label="Decrease quantity"
        className="center h-full w-9 disabled:opacity-40"
      >
        <RiSubtractLine className="size-4" />
      </button>
      <span className="w-8 text-center text-caption tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        onClick={onIncrement}
        disabled={disabled || (max != null && value >= max)}
        aria-label="Increase quantity"
        className="center h-full w-9 disabled:opacity-40"
      >
        <RiAddLine className="size-4" />
      </button>
    </div>
  );
}
