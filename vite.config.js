import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("lucide-react")) return "lucide";
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/") || id.includes("react-router-dom")) return "react-vendor";
          if (id.includes("@supabase")) return "supabase";
        },
      },
    },
  },
});
