import { fr } from './fr';

/**
 * Tiny i18n layer for the OGCC interface (not for parsing OGame — parsers must
 * never depend on translated text). French is the reference locale.
 */

type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };
export type Messages = Widen<typeof fr>;
export type Locale = 'fr';

type Join<K, P> = K extends string ? (P extends string ? `${K}.${P}` : never) : never;
type Paths<T> = { [K in keyof T]: T[K] extends string ? K : Join<K, Paths<T[K]>> }[keyof T];
export type MessageKey = Paths<Messages>;

const dictionaries: Record<Locale, Messages> = { fr };

let current: Messages = dictionaries.fr;

export function setLocale(locale: Locale): void {
  current = dictionaries[locale];
}

/** Returns the translated string for `key`, replacing `{name}` placeholders from `params`. */
export function t(key: MessageKey, params?: Record<string, string | number>): string {
  let node: unknown = current;
  for (const part of key.split('.')) {
    node = typeof node === 'object' && node !== null ? (node as Record<string, unknown>)[part] : undefined;
  }
  if (typeof node !== 'string') return key;
  if (!params) return node;
  return node.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}
