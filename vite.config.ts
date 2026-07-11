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
        includeAssets: ["favicon.ico", "robots.txt", "logo192.png", "logo512.png"],
        manifest: {
          short_name: "Qaza Tracker",
          name: "Qaza Tracker",
          description: "Track your qaza prayers for Muslims.",
          icons: [
            {
              src: "favicon.ico",
              sizes: "64x64 32x32 24x24 16x16",
              type: "image/x-icon",
            },
            {
              src: "logo192.png",
              type: "image/png",
              sizes: "192x192",
            },
            {
              src: "logo512.png",
              type: "image/png",
              sizes: "512x512",
            },
            {
              src: "logo512.png",
              type: "image/png",
              sizes: "512x512",
              purpose: "maskable",
            },
          ],
          start_url: ".",
          scope: ".",
          display: "standalone",
          orientation: "portrait",
          theme_color: "#000000",
          background_color: "#ffffff",
        },
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
