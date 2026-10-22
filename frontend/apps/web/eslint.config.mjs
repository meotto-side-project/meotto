import pluginQuery from "@tanstack/eslint-plugin-query";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import importPlugin from "eslint-plugin-import";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import { configs } from "eslint-plugin-storybook";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...pluginQuery.configs["flat/recommended"],
  eslintConfigPrettier,
  {
    // Reuse import plugin already registered by eslint-config-next to avoid redefinition.
    languageOptions: importPlugin.flatConfigs.recommended.languageOptions,
    rules: importPlugin.flatConfigs.recommended.rules,
  },
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "no-console": "warn",
      "@next/next/no-img-element": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "warn",
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Node.js utility scripts (not application code)
    "scripts/**",
  ]),
  ...configs["flat/recommended"],
]);

export default eslintConfig;
