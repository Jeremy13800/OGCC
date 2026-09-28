import { afterEach, describe, expect, it, vi } from 'vitest';
import { createLogger, setDebugEnabled } from './logger';

describe('logger', () => {
  afterEach(() => { setDebugEnabled(false); });

  it('drops debug output unless debug mode is enabled', () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    const log = createLogger('test');

    log.debug('hidden');
    expect(spy).not.toHaveBeenCalled();

    setDebugEnabled(true);
    log.debug('visible', 42);
    expect(spy).toHaveBeenCalledWith('[OGCC][test]', 'visible', 42);
  });

  it('always forwards warnings and errors', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    createLogger().warn('careful');
    expect(spy).toHaveBeenCalledWith('[OGCC]', 'careful');
  });
});
