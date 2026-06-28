import { defineConfig } from 'vitest/config';

// Note: For full Cloudflare Workers environment, use @cloudflare/vitest-pool-workers.
// This config runs utility/pure-function tests in Node environment.
// Integration tests against actual Workers runtime require: `wrangler dev --local` + fetch.
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
    testTimeout: 10000,
  },
});
