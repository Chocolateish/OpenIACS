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

      //Lib
      "@libBase": path.resolve(__dirname, "src/lib/base/index"),
      "@libColors": path.resolve(__dirname, "./src/lib/colors/index"),
      "@libCommon": path.resolve(__dirname, "./src/lib/common/index"),
      "@libContextmenu": path.resolve(__dirname, "./src/lib/contextmenu/index"),
      "@libEvent": path.resolve(__dirname, "./src/lib/event/index"),
      "@libIcons": path.resolve(__dirname, "./src/lib/icons/index"),
      "@libMath": path.resolve(__dirname, "./src/lib/math/index"),
      "@libResult": path.resolve(__dirname, "./src/lib/result/index"),
      "@libSpinners": path.resolve(__dirname, "./src/lib/spinners/index"),
      "@libState": path.resolve(__dirname, "./src/lib/state/index"),
      "@libString": path.resolve(__dirname, "./src/lib/string/index"),
      "@libSVG": path.resolve(__dirname, "./src/lib/svg/index"),
      "@libTheme": path.resolve(__dirname, "./src/lib/theme/index"),
    },
  },
});
