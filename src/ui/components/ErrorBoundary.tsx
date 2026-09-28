import { Component, type ErrorInfo, type ReactNode } from 'react';
import { t } from '@/shared/i18n';
import { createLogger } from '@/shared/logger';

const log = createLogger('ui');

interface Props {
  readonly children: ReactNode;
}

interface State {
  readonly error: Error | null;
}

/** Contains any OGCC rendering error: OGame itself is never affected. */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    log.error('Render error', error, info.componentStack);
  }

  override render(): ReactNode {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="ogcc-surface m-2 max-w-72 p-3 text-sm">
        <p className="text-fg">{t('errors.crashed')}</p>
        <button
          type="button"
          className="mt-2 rounded-sm border border-line-strong px-2 py-1 text-xs text-action hover:border-action"
          onClick={() => {
            this.setState({ error: null });
          }}
        >
          {t('errors.retry')}
        </button>
      </div>
    );
  }
}
