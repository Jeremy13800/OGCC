import { useId, type ReactNode } from 'react';

interface SwitchProps {
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly hint?: string;
  readonly disabled?: boolean;
  /** Small tag displayed next to the label (e.g. "Bientôt"). */
  readonly badge?: ReactNode;
}

/** Accessible on/off switch (role="switch", keyboard operable, label + hint wired by id). */
export function Switch({ label, checked, onChange, hint, disabled = false, badge }: SwitchProps) {
  const id = useId();
  const hintId = `${id}-hint`;

  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="min-w-0">
        <label htmlFor={id} className={disabled ? 'text-sm text-fg-subtle' : 'cursor-pointer text-sm text-fg'}>
          {label}
        </label>
        {badge}
        {hint && (
          <p id={hintId} className="ogcc-meta mt-0.5">
            {hint}
          </p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={hint ? hintId : undefined}
        disabled={disabled}
        onClick={() => {
          onChange(!checked);
        }}
        className={[
          'relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors duration-150',
          checked ? 'border-tech/60 bg-tech/25' : 'border-line-strong bg-surface-700',
          disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:border-tech/80',
        ].join(' ')}
      >
        <span
          aria-hidden="true"
          className={[
            'inline-block size-3.5 rounded-full transition-transform duration-150 ease-snappy',
            checked ? 'translate-x-[18px] bg-tech' : 'translate-x-[2px] bg-fg-subtle',
          ].join(' ')}
        />
      </button>
    </div>
  );
}
