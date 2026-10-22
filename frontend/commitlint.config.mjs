export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [2, "always", ["web", "mobile", "FE"]],
    "scope-empty": [0],

    "subject-max-length": [2, "always", 50],
    "subject-full-stop": [2, "never", "."],
    "subject-case": [0],

    "body-leading-blank": [2, "always"],
    "body-max-line-length": [0],

    "footer-leading-blank": [0],
    "footer-max-line-length": [0],

    "body-starts-with-dash": [2, "always"],
  },
  plugins: [
    {
      rules: {
        "body-starts-with-dash": (parsed) => {
          const { body } = parsed;

          if (!body) {
            return [true];
          }

          const lines = body
            .split("\n")
            .filter((line) => line.trim().length > 0);
          const allStartWithDash = lines.every((line) =>
            line.trim().startsWith("-"),
          );

          if (!allStartWithDash) {
            return [false, 'body의 각 줄은 "-"로 시작해야 합니다'];
          }

          return [true];
        },
      },
    },
  ],
};
