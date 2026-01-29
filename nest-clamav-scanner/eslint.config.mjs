import { createNestConfig } from "@bratislava/eslint-config-nest";

export default [
  ...createNestConfig({
    tsconfigRootDir: import.meta.dirname,
    ignores: ["src/generated-clients/*"],
  }),

  // Project-specific rule overrides
  {
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "warn", // 1 violations
      "@typescript-eslint/no-unsafe-member-access": "warn", // 1 violations
      "@typescript-eslint/no-unsafe-return": "warn", // 1 violations
    },
  },
];
