import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "placeholder.svg"],
      manifest: {
        name: "Worksheet Exchange Hub",
        short_name: "WorksheetHub",
        description: "Share and learn together through educational worksheets",
        theme_color: "#6d28d9",
        background_color: "#0f0f0f",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/sharepdflogo.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/sharepdflogo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
