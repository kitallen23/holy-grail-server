import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";

export default tseslint.config(
    js.configs.recommended, 
    ...tseslint.configs.recommended, 
    prettier,
    {
        plugins: {
            import: importPlugin,
        },
        rules: {
            "no-console": ["warn", { allow: ["info", "warn", "error"] }],
            "import/extensions": ["error", "always", { 
                "ignorePackages": true,
                "pattern": {
                    "js": "always",
                    "ts": "never"
                }
            }],
        },
    }
);
