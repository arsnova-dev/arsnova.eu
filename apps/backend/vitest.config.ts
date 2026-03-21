import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html'],
      reportsDirectory: './coverage',
      exclude: ['**/node_modules/**', '**/*.test.ts', '**/*.config.ts', '**/dist/**'],
    },
  },
  resolve: {
    alias: {
      '@arsnova/shared-types': path.resolve(__dirname, '../../libs/shared-types/src/index.ts'),
      '@arsnova/api': path.resolve(__dirname, './src/routers/index.ts'),
    },
  },
});
