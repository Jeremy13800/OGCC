import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import {
  DB_VERSION,
  MIGRATIONS,
  assertMigrationsAreSequential,
  getDatabaseStatus,
  openOgccDatabase,
  type Migration,
} from './database';

let counter = 0;
const uniqueName = () => `ogcc-test-${++counter}`;

describe('database migrations', () => {
  it('declares sequential versions', () => {
    expect(() => {
      assertMigrationsAreSequential(MIGRATIONS);
    }).not.toThrow();
    expect(() => {
      assertMigrationsAreSequential([{ ...MIGRATIONS[0], version: 2 } as Migration]);
    }).toThrow();
  });

  it('creates a fresh database at the latest version', async () => {
    const db = await openOgccDatabase(uniqueName());
    expect(getDatabaseStatus(db)).toEqual({ schemaVersion: DB_VERSION, stores: ['meta'] });
    db.close();
  });

  it('upgrades an existing database, running only the missing migrations and keeping data', async () => {
    const name = uniqueName();
    const [first] = MIGRATIONS;
    if (!first) throw new Error('MIGRATIONS must not be empty');

    const old = await openOgccDatabase(name, [first]);
    await old.put('meta', { key: 'installedAt', value: 123, updatedAt: 123 });
    old.close();

    const ran: number[] = [];
    const v2: Migration[] = [
      { ...first, up: () => { ran.push(1); } },
      {
        version: 2,
        description: 'test: add an index-less store',
        up(db) {
          ran.push(2);
          (db as unknown as IDBDatabase).createObjectStore('extra');
        },
      },
    ];

    const upgraded = await openOgccDatabase(name, v2);
    expect(ran).toEqual([2]);
    expect(upgraded.version).toBe(2);
    expect(await upgraded.get('meta', 'installedAt')).toMatchObject({ value: 123 });
    upgraded.close();
  });
});
