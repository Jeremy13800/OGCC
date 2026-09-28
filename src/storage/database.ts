import { openDB, type DBSchema, type IDBPDatabase, type IDBPTransaction, type StoreNames } from 'idb';

/**
 * OGCC IndexedDB database — historical data (snapshots, expeditions, goals…).
 *
 * IMPORTANT: this module must only run in an extension context (service worker),
 * never in the content script: there IndexedDB would belong to the OGame page origin
 * (one database per universe subdomain, readable by page scripts). See docs/storage.md.
 */

export const DB_NAME = 'ogcc';

export interface MetaRecord {
  readonly key: string;
  readonly value: unknown;
  readonly updatedAt: number;
}

/** Schema of the latest version. Add stores here AND a migration below. */
export interface OgccDBSchema extends DBSchema {
  meta: { key: string; value: MetaRecord };
}

export type OgccDatabase = IDBPDatabase<OgccDBSchema>;

export interface Migration {
  readonly version: number;
  readonly description: string;
  up(
    db: OgccDatabase,
    tx: IDBPTransaction<OgccDBSchema, StoreNames<OgccDBSchema>[], 'versionchange'>,
  ): void;
}

/**
 * Append-only list. Never edit or reorder a released migration: add a new one.
 * Versions must be 1, 2, 3… without gaps.
 */
export const MIGRATIONS: readonly Migration[] = [
  {
    version: 1,
    description: 'Create the meta store (schema bookkeeping, install info).',
    up(db) {
      db.createObjectStore('meta', { keyPath: 'key' });
    },
  },
];

export const DB_VERSION = MIGRATIONS.length;

export function assertMigrationsAreSequential(migrations: readonly Migration[]): void {
  migrations.forEach((migration, index) => {
    if (migration.version !== index + 1) {
      throw new Error(`Migration #${index} has version ${migration.version}, expected ${index + 1}.`);
    }
  });
}

export async function openOgccDatabase(
  name: string = DB_NAME,
  migrations: readonly Migration[] = MIGRATIONS,
): Promise<OgccDatabase> {
  assertMigrationsAreSequential(migrations);
  const db = await openDB<OgccDBSchema>(name, migrations.length, {
    upgrade(database, oldVersion, newVersion, transaction) {
      const target = newVersion ?? migrations.length;
      for (const migration of migrations) {
        if (migration.version > oldVersion && migration.version <= target) {
          migration.up(database, transaction);
        }
      }
    },
    blocked() {
      // Another context holds an older version open; it will be closed by `versionchange`.
    },
  });
  // Let a newer version (after an extension update) upgrade without being blocked.
  db.addEventListener('versionchange', () => {
    db.close();
  });
  return db;
}

export interface DatabaseStatus {
  readonly schemaVersion: number;
  readonly stores: readonly string[];
}

export function getDatabaseStatus(db: OgccDatabase): DatabaseStatus {
  return { schemaVersion: db.version, stores: [...db.objectStoreNames] };
}
