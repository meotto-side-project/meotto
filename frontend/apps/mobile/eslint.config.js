const { defineConfig, globalIgnores } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const eslintConfigPrettier = require("eslint-config-prettier/flat");
const simpleImportSort = require("eslint-plugin-simple-import-sort");

module.exports = defineConfig([
  expoConfig,
  eslintConfigPrettier,
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "no-console": "warn",
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
    },
  },
  {
    // The @typescript-eslint plugin is registered by eslint-config-expo for TS files only.
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "warn",
    },
  },
  globalIgnores(["dist/**", ".expo/**", "node_modules/**"]),
]);
