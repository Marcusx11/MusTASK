// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";

// Fronteiras da arquitetura hexagonal: as dependências apontam para dentro.
//   domain       → não importa nada além de arquivos do próprio domain
//   application  → importa só domain (e a si mesma)
//   adapters     → podem importar application e domain
const nonRelativeImport = {
  regex: "^(?!\\.)",
  message: "A camada interna não pode depender de pacotes externos.",
};

export default tseslint.config(
  { ignores: ["node_modules", "dist", ".vibe-wise", ".claude"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/domain/**/*.ts"],
    ignores: ["src/**/*.test.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            nonRelativeImport,
            {
              regex: "(^|/)(application|adapters)(/|$)",
              message: "domain não pode importar de application nem de adapters.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/application/**/*.ts"],
    ignores: ["src/**/*.test.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            nonRelativeImport,
            {
              regex: "(^|/)adapters(/|$)",
              message: "application não pode importar de adapters; dependa de uma porta.",
            },
          ],
        },
      ],
    },
  },
);
