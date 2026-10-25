/** @type {import('tailwindcss').Config} */
import slsPreset from "./tailwind-preset.js";

export default {
  presets: [slsPreset],
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  plugins: [],
};
