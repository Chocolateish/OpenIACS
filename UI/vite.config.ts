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
      "@libCommon": path.resolve(__dirname, "src/lib/common/index"),
      "@libComponents": path.resolve(__dirname, "src/lib/components/index"),
      "@libComponentsCSS": path.resolve(__dirname, "src/lib/components/"),
      "@libEvent": path.resolve(__dirname, "src/lib/event/index"),
      "@libInstr": path.resolve(__dirname, "src/lib/instruments/index"),
      "@libLister": path.resolve(__dirname, "src/lib/lister/index"),
      "@libMenu": path.resolve(__dirname, "src/lib/menu/index"),
      "@libPages": path.resolve(__dirname, "src/lib/pages/index"),
      "@libPrompts": path.resolve(__dirname, "src/lib/prompts/index"),
      "@libUI": path.resolve(__dirname, "src/lib/ui/index"),
      "@libValues": path.resolve(__dirname, "src/lib/values/index"),
      "@libTheme": path.resolve(__dirname, "src/lib/theme/index"),
      "@libResult": path.resolve(__dirname, "src/lib/result"),
      "@libState": path.resolve(__dirname, "src/lib/state"),
      "@libColors": path.resolve(__dirname, "src/lib/colors"),
      "@libExtFeat": path.resolve(__dirname, "src/lib/externalFeatures"),
      "@libIcons": path.resolve(__dirname, "src/lib/icons"),

      //Modules
      "@modCommon": path.resolve(__dirname, "src/modules/common/index"),
      "@alarm": path.resolve(__dirname, "src/modules/alarm"),
      "@components": path.resolve(__dirname, "src/modules/components"),
      "@common": path.resolve(__dirname, "src/modules/common"),
      "@globals": path.resolve(__dirname, "src/modules/globals"),
      "@ioSystem": path.resolve(__dirname, "src/modules/ioSystem"),
      "@module": path.resolve(__dirname, "src/modules/module"),
      "@modules": path.resolve(__dirname, "src/modules/modules"),
      "@system": path.resolve(__dirname, "src/modules/system"),
    },
  },
});
