import { describe, expect, it } from 'vitest';
import { extractPropertyDefaults, prepareShadowCss } from './shadow-styles';

const TAILWIND_LIKE = `
@layer theme, base, components, utilities;
@property --tw-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}
@property --tw-ring-inset { syntax: "*"; inherits: false }
@property --tw-font-weight { syntax: "*"; inherits: true; initial-value: 400; }
.shadow-panel{box-shadow:var(--tw-shadow)}
`;

describe('extractPropertyDefaults', () => {
  it('reads minified and formatted rules, skipping those without initial value', () => {
    expect(extractPropertyDefaults(TAILWIND_LIKE)).toEqual([
      { name: '--tw-shadow', inherits: false, initialValue: '0 0 #0000' },
      { name: '--tw-font-weight', inherits: true, initialValue: '400' },
    ]);
  });
});

describe('prepareShadowCss', () => {
  it('prepends a lowest-priority layer with the initial values', () => {
    const result = prepareShadowCss(TAILWIND_LIKE);
    expect(result.startsWith('@layer ogcc-property-defaults{')).toBe(true);
    expect(result).toContain(':host,*,::before,::after,::backdrop{--tw-shadow:0 0 #0000}');
    expect(result).toContain(':host{--tw-font-weight:400}');
    expect(result.indexOf('ogcc-property-defaults')).toBeLessThan(result.indexOf('@layer theme'));
    expect(result).toContain(TAILWIND_LIKE);
  });

  it('leaves CSS without @property untouched', () => {
    expect(prepareShadowCss('.a{color:red}')).toBe('.a{color:red}');
  });
});
