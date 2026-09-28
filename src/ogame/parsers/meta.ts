import { ogameSelectors, type OGameMetaKey } from '../selectors';

export type OGameMeta = Partial<Record<OGameMetaKey, string>>;

/**
 * Reads the `ogame-*` meta tags that are present. Missing or empty tags are simply
 * omitted — never defaulted. Used for diagnostics until the tags are verified.
 */
export function readOGameMeta(root: ParentNode): OGameMeta {
  const meta: OGameMeta = {};
  for (const [key, selector] of Object.entries(ogameSelectors.meta) as [OGameMetaKey, string][]) {
    const content = root.querySelector(selector)?.getAttribute('content')?.trim();
    if (content) meta[key] = content;
  }
  return meta;
}
