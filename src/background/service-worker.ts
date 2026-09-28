import {
  isOgccRequest,
  type OgccMessageType,
  type OgccMessages,
  type OgccRequest,
  type OgccResponse,
  type Result,
} from '@/shared/messaging';
import { createLogger } from '@/shared/logger';
import {
  getDatabaseStatus,
  openOgccDatabase,
  type DatabaseStatus,
  type OgccDatabase,
} from '@/storage/database';

/**
 * Background service worker. Justification (see docs/architecture.md): it is the only
 * extension-origin context always reachable from the content script, so it owns
 * IndexedDB. It never talks to OGame servers and never triggers game actions.
 */

const log = createLogger('background');

let databasePromise: Promise<OgccDatabase> | null = null;

function getDatabase(): Promise<OgccDatabase> {
  databasePromise ??= openOgccDatabase().catch((error: unknown) => {
    databasePromise = null;
    throw error;
  });
  return databasePromise;
}

type Handlers = {
  [K in OgccMessageType]: (request: OgccMessages[K]['request']) => Promise<OgccResponse<K>>;
};

/** One handler per message type — the compiler enforces that none is missing. */
const handlers: Handlers = {
  'ogcc/status': async () => {
    let database: Result<DatabaseStatus>;
    try {
      database = { ok: true, data: getDatabaseStatus(await getDatabase()) };
    } catch (error) {
      log.error('Database unavailable', error);
      database = { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
    return { extensionVersion: chrome.runtime.getManifest().version, database };
  },
};

async function handle(request: OgccRequest): Promise<Result<unknown>> {
  return { ok: true, data: await handlers[request.type](request) };
}

chrome.runtime.onMessage.addListener((message: unknown, sender, sendResponse) => {
  // Only our own extension contexts; ignore anything else silently.
  if (sender.id !== chrome.runtime.id || !isOgccRequest(message)) return false;
  handle(message).then(sendResponse, (error: unknown) => {
    log.error('Message handler failed', message.type, error);
    sendResponse({ ok: false, error: 'Internal error' });
  });
  return true; // keeps the channel open for the async response
});
