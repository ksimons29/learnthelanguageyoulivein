import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Auto-generated service worker (serwist)
    "public/sw.js",
    // Test scripts using CommonJS
    "scripts/**/*.js",
  ]),
  // Custom rule overrides
  {
    rules: {
      // Disable overly-strict rule that flags valid patterns like
      // initializing state from browser APIs in useEffect
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
