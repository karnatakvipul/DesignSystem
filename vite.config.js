/// <reference types="vitest/config" />
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { createRequire } from 'module';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import tailwindcss from '@tailwindcss/vite';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

// `__dirname` needs no polyfill here: Vite bundles `vite.config.js` itself
// through esbuild with a Node-compatible shim regardless of this package's
// own `"type": "module"`, so the bare CJS global is available in this one
// file even though every other `.js` file in the project is a real ES module.
const pkg = createRequire(import.meta.url)('./package.json');

/**
 * Nothing this package declares as a dependency may be bundled into it.
 *
 * Bundling them was doing real damage. `recharts` alone accounts for most of a
 * 995 kB bundle a consumer would download whether or not it renders a chart,
 * and its CommonJS interop emitted a bare `require("react")` into the ESM
 * output — which throws on load in any pure-ESM environment, so the published
 * package did not import at all.
 *
 * The subtler cost is duplication. A consumer that also uses React or recharts
 * ends up with two copies, and two copies of React means two sets of contexts:
 * hooks fail, providers silently do not reach their children.
 *
 * Derived from package.json rather than hand-listed, so adding a dependency
 * cannot quietly reintroduce this.
 */
const external = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
].map((name) => new RegExp(`^${name}(/.*)?$`));

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    cssInjectedByJsPlugin()
  ],
  // @storybook/addon-vitest's own setup file (loaded as a Vitest `setupFile`,
  // not imported from anywhere in this project's source, so Vite's dependency
  // scanner never crawls it) pulls in plain-CJS packages several levels deep
  // via @storybook/addon-a11y's preview runtime — aria-query (element role
  // lookups) and lz-string (axe-core's state encoding). Both ship CJS with no
  // `exports` field; named-imports of them fail with "does not provide an
  // export named ..." unless forced into the pre-bundle by hand here.
  optimizeDeps: {
    include: ['aria-query', 'lz-string', 'pretty-format', 'ansi-styles'],
  },
  server: {
    host: true, // Listen on all local IP addresses (0.0.0.0)
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
    },
  },
  build: {
    cssCodeSplit: true,
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'SlsUi',
      fileName: (format) => (format === 'umd' ? 'index.umd.cjs' : `index.${format}.js`)
    },
    rollupOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/, ...external],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          clsx: 'clsx',
          'lucide-react': 'lucideReact',
          recharts: 'Recharts'
        }
      }
    }
  },
  test: {
    // Two projects rather than one `test` block: the existing jsdom unit
    // suite, and a second project that runs every `*.stories.*` file as a
    // real Playwright/Chromium assertion — each story is both a Storybook
    // preview and an automated regression check for free, catching
    // rendering crashes the jsdom suite's own mocked DOM can't.
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          globals: true,
          environment: 'jsdom',
          setupFiles: './src/test/setup.js',
          include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
        },
      },
      {
        extends: true,
        plugins: [
          // See options at:
          // https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: resolve(__dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          // The addon's default is 15s, which is enough for a story on an idle
          // machine and not enough on a busy one. These run a real Chromium
          // alongside the jsdom project, so under `vitest run` the two compete
          // for the same cores — and what fails is whichever story happened to
          // be mid-render when the clock ran out, a different one each time.
          // Raising the ceiling costs nothing when things are fast (a passing
          // story still finishes in well under a second) and stops a loaded
          // CI runner from reporting a rendering failure that isn't one.
          testTimeout: 60000,
          hookTimeout: 60000,
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  }
});
