import js from "@eslint/js";
import pluginSecurity from "eslint-plugin-security";

export default [
  js.configs.recommended,
  pluginSecurity.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      // Custom rules can go here
    }
  }
];