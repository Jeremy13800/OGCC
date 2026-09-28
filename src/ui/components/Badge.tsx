import type { ReactNode } from 'react';

type Tone = 'neutral' | 'tech' | 'positive' | 'warning' | 'danger' | 'special';

const TONES: Record<Tone, string> = {
  neutral: 'border-line-strong text-fg-subtle',
  tech: 'border-tech/40 text-tech',
  positive: 'border-positive/40 text-positive',
  warning: 'border-warning/40 text-warning',
  danger: 'border-danger/40 text-danger',
  special: 'border-special/40 text-special',
};

export function Badge({ tone = 'neutral', children }: { readonly tone?: Tone; readonly children: ReactNode }) {
  return (
    <span
      className={`ml-2 inline-block rounded-xs border px-1.5 align-middle text-2xs font-semibold tracking-wide uppercase ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
