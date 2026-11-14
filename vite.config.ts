import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

const appName = 'LIN4CRE QUOTES';
const appDescription =
  'Discover, collect and share carefully attributed quotes. Daily inspiration, categories, authors, favourites and custom collections — all stored on your device.';

export default defineConfig({
  server: { host: '0.0.0.0', allowedHosts: ['.e2b.app'] },
  preview: { host: '0.0.0.0', allowedHosts: ['.e2b.app'] },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: [
        'favicon.svg',
        'favicon.ico',
        'favicon-32.png',
        'apple-touch-icon.png',
        'robots.txt',
      ],
      manifest: {
        name: appName,
        short_name: 'Quotes',
        description: appDescription,
        lang: 'en-GB',
        dir: 'ltr',
        id: '/',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui', 'browser'],
        orientation: 'any',
        background_color: '#08090b',
        theme_color: '#08090b',
        categories: ['books', 'education', 'lifestyle'],
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Discover a quote',
            short_name: 'Discover',
            description: 'Open the daily quote and random generator',
            url: '/',
            icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Your favourites',
            short_name: 'Favourites',
            description: 'Browse the quotes you saved',
            url: '/favourites',
            icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Search quotes',
            short_name: 'Search',
            description: 'Search quote text and authors',
            url: '/search',
            icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,webmanifest,txt}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /\.[a-z0-9]{2,5}$/i],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: false,
        runtimeCaching: [
          {
            // Live advice is deliberately network-only: stale advice presented
            // as fresh would be misleading. Saved entries live in local storage.
            urlPattern: /^https:\/\/api\.adviceslip\.com\/.*/i,
            handler: 'NetworkOnly',
            method: 'GET',
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    reportCompressedSize: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    alias: {
      'virtual:pwa-register/react': fileURLToPath(
        new URL('./src/test/pwaRegisterMock.ts', import.meta.url),
      ),
    },
    css: false,
    restoreMocks: true,
    clearMocks: true,
    coverage: {
      reporter: ['text', 'json-summary'],
      include: ['src/lib/**', 'src/services/**', 'src/data/**'],
    },
  },
});
