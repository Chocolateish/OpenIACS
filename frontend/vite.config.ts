/// <reference types="vitest/config" />
import { playwright } from "@vitest/browser-playwright";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 9998,
    host: true,
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),
    chunkSizeWarningLimit: 2000,
    emptyOutDir: true,
  },
  root: path.resolve(__dirname, "src"),
  test: {
    browser: {
      provider: playwright(),
      enabled: true,
      instances: [{ browser: "chromium" }],
    },
  },
  resolve: {
    alias: {
      "@package": path.resolve(__dirname, "package.json"),

      //Lib
      "@libBase": path.resolve(__dirname, "src/lib/base/index"),
      "@libColors": path.resolve(__dirname, "./src/lib/colors/index"),
      "@libCommon": path.resolve(__dirname, "./src/lib/common/index"),
      "@libComposition": path.resolve(__dirname, "./src/lib/composition/index"),
      "@libContextmenu": path.resolve(__dirname, "./src/lib/contextmenu/index"),
      "@libDocument": path.resolve(__dirname, "./src/lib/document/index"),
      "@libEvent": path.resolve(__dirname, "./src/lib/event/index"),
      "@libForm": path.resolve(__dirname, "./src/lib/form/index"),
      "@libIcons": path.resolve(__dirname, "./src/lib/icons/index"),
      "@libIconsFonts": path.resolve(__dirname, "./src/lib/icons/font.scss"),
      "@libMath": path.resolve(__dirname, "./src/lib/math/index"),
      "@libResult": path.resolve(__dirname, "./src/lib/result/index"),
      "@libSettings": path.resolve(__dirname, "./src/lib/settings/index"),
      "@libSpinners": path.resolve(__dirname, "./src/lib/spinners/index"),
      "@libState": path.resolve(__dirname, "./src/lib/state/index"),
      "@libString": path.resolve(__dirname, "./src/lib/string/index"),
      "@libSVG": path.resolve(__dirname, "./src/lib/svg/index"),
      "@libTheme": path.resolve(__dirname, "./src/lib/theme/index"),
      "@libThemeCommon": path.resolve(__dirname, "./src/lib/theme/builtIn"),
    },
  },
});
