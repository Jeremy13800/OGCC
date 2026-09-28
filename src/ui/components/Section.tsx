import { useId, type ReactNode } from 'react';

/** Titled block inside a panel. */
export function Section({ title, children }: { readonly title: string; readonly children: ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="border-t border-line px-4 py-3 first:border-t-0">
      <h3 id={id} className="ogcc-section-title mb-1">
        {title}
      </h3>
      {children}
    </section>
  );
}
