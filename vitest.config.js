import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node', // we manage our own jsdom instances
  },
});
