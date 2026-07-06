import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        paper: "#faf8f3",
        moss: "#4f6f52",
        tide: "#1f7a8c",
        coral: "#d8674c",
        plum: "#6f4d7c",
        gold: "#c99a35"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(20, 20, 20, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
