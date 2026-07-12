import { defineConfig, loadEnv } from "vite";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackRouter } from "@tanstack/router-plugin/vite";

import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    resolve: { tsconfigPaths: true },
    plugins: [
      devtools(),
      tailwindcss(),
      tanstackRouter({ target: "react", autoCodeSplitting: true }),
      viteReact(),
      VitePWA({
        registerType: "prompt",
        includeAssets: [
          "favicon.ico",
          "robots.txt",
          "apple-touch-icon.png",
          "favicon-16x16.png",
          "favicon-32x32.png",
          "android-chrome-192x192.png",
          "android-chrome-512x512.png",
          "site.webmanifest",
        ],
        manifest: false,
        workbox: {
          globPatterns: ["**/*.{js,css,html,svg,png,ico,woff,woff2}"],
          navigateFallback: "index.html",
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    server: {
      proxy: {
        "/ingest/static": {
          target: "https://eu-assets.i.posthog.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ingest/, ""),
        },
        "/ingest/array": {
          target: "https://eu-assets.i.posthog.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ingest/, ""),
        },
        "/ingest": {
          target: env.VITE_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ingest/, ""),
        },
      },
    },
  };
});

export default config;
