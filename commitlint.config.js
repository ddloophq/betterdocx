export default {
    extends: ["@commitlint/config-conventional"],
    rules: {
        // Type must be one of these
        "type-enum": [
            2,
            "always",
            ["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "revert"],
        ],
        // Type is required and must be lowercase
        "type-case": [2, "always", "lower-case"],
        "type-empty": [2, "never"],
        // Subject is required and must start lowercase
        "subject-empty": [2, "never"],
        "subject-case": [2, "always", "lower-case"],
        // No period at end of subject
        "subject-full-stop": [2, "never", "."],
        // Header max length
        "header-max-length": [2, "always", 100],
    },
};
