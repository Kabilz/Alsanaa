import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ملفات PHP التي يجب نسخها إلى dist بعد كل build
const phpFiles = ["edfali.php", "yusrpay.php"];

const copyPhpPlugin = {
  name: "copy-php-files",
  closeBundle() {
    phpFiles.forEach((file) => {
      const src = path.resolve(__dirname, file);
      const dest = path.resolve(__dirname, "dist", file);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`✅ Copied ${file} → dist/${file}`);
      }
    });
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), copyPhpPlugin],
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
