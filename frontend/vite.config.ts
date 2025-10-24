import path from "path";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  server: {
    port: 9999,
  },
  root: path.resolve(__dirname, "src"),
  resolve: {
    alias: {
      "@package": path.resolve(__dirname, "package.json"),
      // Common
      "@libResult": path.resolve(__dirname, "src/lib/common/result"),
      "@libState": path.resolve(__dirname, "src/lib/common/state"),
      "@libEvent": path.resolve(__dirname, "src/lib/common/event"),
      "@libString": path.resolve(__dirname, "src/lib/common/string"),
      "@libMath": path.resolve(__dirname, "src/lib/common/math"),
      "@libColors": path.resolve(__dirname, "src/lib/common/colors"),
      // UI
      "@common": path.resolve(__dirname, "src/lib/ui/common"),
      "@base": path.resolve(__dirname, "src/lib/ui/base"),
      "@theme": path.resolve(__dirname, "src/lib/ui/theme"),
      "@icons": path.resolve(__dirname, "src/lib/ui/icons"),
      "@svg": path.resolve(__dirname, "src/lib/ui/svg"),
      "@spinners": path.resolve(__dirname, "src/lib/ui/spinners"),
      "@contextmenu": path.resolve(__dirname, "src/lib/ui/contextmenu"),
    },
  },
});
