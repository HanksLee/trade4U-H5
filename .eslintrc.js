module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    sourceType: "module",
  },
  parser: "@typescript-eslint/parser",
  extends: [
    // React hook 错误讯息提示
    "plugin:react-hooks/recommended",
  ],
  rules: {
    "no-console": 2,
  },
};
