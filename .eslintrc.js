module.exports = {
    parser: "@typescript-eslint/parser",
    extends: ["@typescript-eslint/recommended", "prettier"],
    plugins: ["@typescript-eslint", "prettier"],
    rules: {
        "prettier/prettier": "error",
    },
};
