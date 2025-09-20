/// <reference types="node" />
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5123,
  },
  resolve: {
    alias: {
      "@package": path.resolve(__dirname, "package.json"),
      // Common
      "@result": path.resolve(__dirname, "src/lib/common/result"),
      "@state": path.resolve(__dirname, "src/lib/common/state"),
      "@event": path.resolve(__dirname, "src/lib/common/event"),
      "@string": path.resolve(__dirname, "src/lib/common/string"),
      "@math": path.resolve(__dirname, "src/lib/common/math"),
      "@colors": path.resolve(__dirname, "src/lib/common/colors"),
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
