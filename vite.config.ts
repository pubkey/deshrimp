import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
// @ts-expect-error - plain .mjs build plugins, no types needed
import seo from './scripts/seo.mjs';
// @ts-expect-error - plain .mjs build plugins, no types needed
import pwa from './scripts/pwa.mjs';

/**
 * Two aliases and one define block, and that is the whole build.
 *
 * The aliases exist because the app was written against them; keeping the names
 * means the app's own source is unchanged from the version that is already
 * running. They point at ordinary folders — there is no global injection and no
 * generator step behind them any more.
 *
 * Two build-only plugins sit alongside them: `seo()` writes the head and the
 * crawlable copy into `index.html`, `pwa()` emits the service worker. Both are
 * `apply: 'build'`, so `npm run dev` is exactly what it was.
 */
export default defineConfig({
    // Relative asset URLs, so the built page also works from a subdirectory
    // (GitHub Pages serves it from /<repo>/) and from the file system.
    base: './',
    plugins: [react(), seo(), pwa()],
    resolve: {
        alias: {
            '@ui': resolve(__dirname, 'src/ui'),
            '@db': resolve(__dirname, 'src/lib/db.ts'),
            '@app': resolve(__dirname, 'src/lib/config.ts'),
            '@charts': resolve(__dirname, 'src/lib/charts'),
        },
    },
    define: {
        __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
        __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    build: { target: 'es2020', chunkSizeWarningLimit: 2000 },
    server: { port: 5173 },
});
