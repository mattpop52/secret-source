"use client";

export function QuantityStepper({
  value,
  onChange,
  label,
  max = 9,
}: {
  value: number;
  onChange: (next: number) => void;
  label: string;
  max?: number;
}) {
  return (
    <div className="flex items-center border border-[var(--ss-hairline-strong)]">
      <button
        aria-label={`Decrease quantity of ${label}`}
        className="h-10 w-10 text-[var(--ss-smoke)] text-lg transition-colors hover:bg-[var(--ss-panel-high)] hover:text-[var(--ss-bone)] disabled:opacity-40 disabled:hover:bg-transparent"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
        type="button"
      >
        &minus;
      </button>
      <span aria-live="polite" className="ss-num w-9 text-center text-sm">
        {value}
      </span>
      <button
        aria-label={`Increase quantity of ${label}`}
        className="h-10 w-10 text-[var(--ss-smoke)] text-lg transition-colors hover:bg-[var(--ss-panel-high)] hover:text-[var(--ss-bone)] disabled:opacity-40 disabled:hover:bg-transparent"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        type="button"
      >
        +
      </button>
    </div>
  );
}
