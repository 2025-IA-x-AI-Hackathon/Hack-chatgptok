import { fileURLToPath } from "url";
import { dirname } from "path";
import { FlatCompat } from "@eslint/eslintrc";
import airbnb from "eslint-config-airbnb";
import prettier from "eslint-plugin-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname, // 필수: 현재 디렉토리 설정
});

export default [
  ...compat.extends("airbnb"),
  ...compat.extends("plugin:prettier/recommended"),
  {
    rules: {
      "prettier/prettier": ["error"],
      "no-console": "off",
    },
    ignores: [
      "node_modules/",
      "package.json",
      "package-lock.json",
      "yarn-error.json",
      "yarn.lock",
      "*.md",
      "*.log",
    ],
  },
];
