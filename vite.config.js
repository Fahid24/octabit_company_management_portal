import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      devOptions: {
        enabled: true, // 👈 enable service worker in dev mode
        type: "module",
      },
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "pwa-192x192.png",
        "pwa-512x512.png",
        "robots.txt"
      ],
      manifest: {
        name: "Troublynx",
        short_name: "Troublynx",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff", // ✅ Splash screen bg
        theme_color: "#ffffff",      // ✅ Browser tab color
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable" // optional for transparent icon support
          }
        ]
      },
      workbox: {
        // Set the maximum file size Workbox will precache (100MB)
        maximumFileSizeToCacheInBytes: 100 * 1024 * 1024,
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
