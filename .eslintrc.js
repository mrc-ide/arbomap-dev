/**
 * .eslint.js
 *
 * ESLint configuration file.
 */

module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: ["plugin:vue/vue3-essential", "@vue/airbnb", "@vue/typescript/recommended", "plugin:prettier/recommended"],
    rules: {
        "vue/multi-word-component-names": "off",
        "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
        quotes: ["error", "double", { avoidEscape: true }],
        "max-len": [2, 120, 4],
        "import/prefer-default-export": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "no-plusplus": "off",
        "no-shadow": "off",
        "@typescript-eslint/no-shadow": ["error"],
        "no-underscore-dangle": "off",
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": ["error"],
        "no-await-in-loop": "off",
        "no-useless-concat": "off",
        "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
        "import/no-unresolved": "off",
        "import/extensions": "off",
        "prefer-destructuring": ["error", { object: true, array: false }]
    }
};
