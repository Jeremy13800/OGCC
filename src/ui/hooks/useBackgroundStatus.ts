import { useEffect, useState } from 'react';
import { sendToBackground, type OgccResponse, type Result } from '@/shared/messaging';

type Status = Result<OgccResponse<'ogcc/status'>> | null;

/** Asks the service worker for its status once (null while pending). */
export function useBackgroundStatus(): Status {
  const [status, setStatus] = useState<Status>(null);
  useEffect(() => {
    let cancelled = false;
    void sendToBackground<'ogcc/status'>({ type: 'ogcc/status' }).then((result) => {
      if (!cancelled) setStatus(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return status;
}
