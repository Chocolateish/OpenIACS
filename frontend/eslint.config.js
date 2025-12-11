import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  tseslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  globalIgnores(["dist/*", "src/pages*", "eslint.config.js"]),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-misused-promises": "off",
    },
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  }
);
