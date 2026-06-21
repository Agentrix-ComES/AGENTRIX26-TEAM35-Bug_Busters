import js from "@eslint/js";
import globals from "globals";
import reactPlugin from "eslint-plugin-react";

export default [
    { ignores: ["dist/"] },
    js.configs.recommended,
    {
        plugins: {
            react: reactPlugin,
        },
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.es2021
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: true
                }
            }
        },
        rules: {
            "no-unused-vars": "warn",
            "no-console": "off",
            "no-undef": "off",
            "react/prop-types": "off",
            "react/jsx-uses-react": "error",
            "react/jsx-uses-vars": "error"
        }
    }
];
