// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from "@eslint/js";
import globals from "globals";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import eslintConfigPrettier from "eslint-config-prettier";

export default [js.configs.recommended, eslintConfigPrettier, {
  files: ["src/**/*.{js,jsx}"],
  plugins: {
    react: reactPlugin,
    "react-hooks": reactHooksPlugin,
  },
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    globals: {
      ...globals.browser,
      ...globals.es2021,
      ...globals.node,
    },
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  rules: {
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "no-undef": "error",
    "no-console": ["warn", { allow: ["warn", "error"] }],
    // Tells `no-unused-vars` that a name referenced from JSX counts as used.
    // Without it every component imported for its markup — which is most of
    // them — is reported unused, and that noise buries the warnings worth
    // reading.
    "react/jsx-uses-vars": "error",
    // Both off because the automatic JSX runtime does not need React in
    // scope. An explicit `import React` in a file that only writes JSX is
    // therefore genuinely unused, and is reported as such.
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
}, ...storybook.configs["flat/recommended"]];
