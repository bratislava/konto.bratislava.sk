import { createNestConfig } from "@bratislava/eslint-config-nest";

const config = createNestConfig({
  tsconfigRootDir: import.meta.dirname,
  ignores: ["src/generated-clients/*"],
});

// Flatten any nested arrays in the config (workaround for @eslint/markdown nested array issue)
const flattenedConfig = config.flat(Infinity);

const errorRuleOverrides = {
  // 1
  "@typescript-eslint/no-unsafe-assignment": "warn",
  // 1
  "@typescript-eslint/no-unsafe-member-access": "warn",
  // 1
  "@typescript-eslint/no-unsafe-return": "warn",
};

const removedRuleIds = new Set();

const overriddenConfig = flattenedConfig.map((entry) => {
  if (!entry.rules) {
    return entry;
  }

  const rules = { ...entry.rules };

  for (const ruleId of removedRuleIds) {
    if (ruleId in rules) {
      delete rules[ruleId];
    }
  }

  for (const [ruleId, level] of Object.entries(errorRuleOverrides)) {
    if (ruleId in rules) {
      rules[ruleId] = level;
    }
  }

  return {
    ...entry,
    rules,
  };
});

export default overriddenConfig;
