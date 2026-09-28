import type { DatabaseStatus } from '@/storage/database';

/**
 * Typed messages between the content script / popup and the background service worker.
 * The service worker owns IndexedDB; other contexts reach it only through these messages.
 */

export type Result<T> = { readonly ok: true; readonly data: T } | { readonly ok: false; readonly error: string };

export interface OgccMessages {
  'ogcc/status': {
    request: { type: 'ogcc/status' };
    response: { extensionVersion: string; database: Result<DatabaseStatus> };
  };
}

export type OgccMessageType = keyof OgccMessages;
export type OgccRequest = OgccMessages[OgccMessageType]['request'];
export type OgccResponse<T extends OgccMessageType> = OgccMessages[T]['response'];

const MESSAGE_TYPES: readonly OgccMessageType[] = ['ogcc/status'];

export function isOgccRequest(value: unknown): value is OgccRequest {
  return (
    typeof value === 'object' &&
    value !== null &&
    MESSAGE_TYPES.includes((value as { type?: unknown }).type as OgccMessageType)
  );
}

export async function sendToBackground<T extends OgccMessageType>(
  request: OgccMessages[T]['request'],
): Promise<Result<OgccResponse<T>>> {
  try {
    const response: unknown = await chrome.runtime.sendMessage(request);
    if (typeof response !== 'object' || response === null || !('ok' in response)) {
      return { ok: false, error: 'No response from the background service worker.' };
    }
    // Shape guaranteed by the typed handler map in the service worker.
    return response as Result<OgccResponse<T>>;
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
