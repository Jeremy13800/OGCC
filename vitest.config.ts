import { defineConfig, mergeConfig } from 'vitest/config';
import { sharedConfig } from './vite.shared.ts';

export default mergeConfig(
  sharedConfig('test'),
  defineConfig({
    test: {
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
      environment: 'node',
      restoreMocks: true,
    },
  }),
);
