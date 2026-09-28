/**
 * Chrome ignores `@property` rules inside a Shadow DOM stylesheet. Tailwind v4 relies on
 * them for the initial values of its internal `--tw-*` variables (shadows, rings,
 * transforms…), so those utilities silently break in a shadow root.
 *
 * Instead of registering the properties on the OGame page (global side effect), we
 * re-declare their initial values as plain custom properties, in a cascade layer
 * placed before all others so any utility still overrides them.
 */

const PROPERTY_RULE = /@property\s+(--[\w-]+)\s*\{([^}]*)\}/g;

interface PropertyDefault {
  readonly name: string;
  readonly inherits: boolean;
  readonly initialValue: string;
}

export function extractPropertyDefaults(css: string): PropertyDefault[] {
  const defaults: PropertyDefault[] = [];
  for (const [, name = '', body = ''] of css.matchAll(PROPERTY_RULE)) {
    const initialValue = /initial-value\s*:\s*([^;]+)/.exec(body)?.[1]?.trim();
    if (initialValue === undefined) continue;
    const inherits = /inherits\s*:\s*true/.test(body);
    defaults.push({ name, inherits, initialValue });
  }
  return defaults;
}

export function prepareShadowCss(css: string): string {
  const defaults = extractPropertyDefaults(css);
  if (defaults.length === 0) return css;

  const declarations = (list: PropertyDefault[]) =>
    list.map(({ name, initialValue }) => `${name}:${initialValue}`).join(';');

  // Non-inherited properties must be reset on every element; inherited ones only at the root.
  const perElement = defaults.filter((d) => !d.inherits);
  const inherited = defaults.filter((d) => d.inherits);

  const rules = [
    perElement.length > 0 ? `:host,*,::before,::after,::backdrop{${declarations(perElement)}}` : '',
    inherited.length > 0 ? `:host{${declarations(inherited)}}` : '',
  ].join('');

  // A layer declared first has the lowest priority among layers.
  return `@layer ogcc-property-defaults{${rules}}\n${css}`;
}
