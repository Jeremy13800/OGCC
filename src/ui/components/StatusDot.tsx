type State = 'ok' | 'pending' | 'error';

const COLORS: Record<State, string> = {
  ok: 'bg-positive shadow-[0_0_8px_var(--color-positive)]',
  pending: 'bg-warning animate-pulse-dot',
  error: 'bg-danger',
};

/** Decorative state indicator. The state must also be conveyed by text next to it. */
export function StatusDot({ state }: { readonly state: State }) {
  return <span aria-hidden="true" className={`inline-block size-2 shrink-0 rounded-full ${COLORS[state]}`} />;
}
