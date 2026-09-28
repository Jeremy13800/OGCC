import type { ReactNode } from 'react';
import { t } from '@/shared/i18n';
import { Section } from '../components/Section';
import { StatusDot } from '../components/StatusDot';
import { useBackgroundStatus } from '../hooks/useBackgroundStatus';

/** Page information, already extracted by the OGame adapter (the UI never reads the game DOM). */
export interface PageInfo {
  readonly view: string | null;
  readonly universe: string;
  readonly metaFound: number;
  readonly metaTotal: number;
}

interface StatusSectionProps {
  readonly page?: PageInfo;
  readonly showDiagnostics?: boolean;
}

export function StatusSection({ page, showDiagnostics = false }: StatusSectionProps) {
  const status = useBackgroundStatus();
  const database = status?.ok ? status.data.database : null;

  let storage: ReactNode;
  if (status === null) {
    storage = <Value state="pending">{t('status.storagePending')}</Value>;
  } else if (database?.ok) {
    storage = <Value state="ok">{t('status.storageOk', { version: database.data.schemaVersion })}</Value>;
  } else {
    storage = <Value state="error">{t('status.storageError')}</Value>;
  }

  return (
    <Section title={t('status.title')}>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 py-1 text-sm">
        {page && (
          <>
            <Row label={t('status.page')}>
              <span className="ogcc-value text-tech">{page.view ?? t('status.unknown')}</span>
            </Row>
            <Row label={t('status.universe')}>
              <span className="ogcc-value">{page.universe}</span>
            </Row>
          </>
        )}
        <Row label={t('status.storage')}>{storage}</Row>
        {page && showDiagnostics && (
          <Row label={t('status.meta')}>
            <span className="ogcc-value">
              {t('status.metaFound', { found: page.metaFound, total: page.metaTotal })}
            </span>
          </Row>
        )}
      </dl>
    </Section>
  );
}

function Row({ label, children }: { readonly label: string; readonly children: ReactNode }) {
  return (
    <>
      <dt className="ogcc-label">{label}</dt>
      <dd className="min-w-0 truncate text-right">{children}</dd>
    </>
  );
}

function Value({ state, children }: { readonly state: 'ok' | 'pending' | 'error'; readonly children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      <StatusDot state={state} />
      {children}
    </span>
  );
}
