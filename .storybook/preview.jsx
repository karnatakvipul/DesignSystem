import React from "react";
import "../src/index.css";
import { ThemeProvider, THEMES, DEFAULT_THEME } from "../src/theme";

/**
 * A toolbar theme switcher rather than Storybook's own `backgrounds` addon.
 * Background alone doesn't answer "does this button still read as a button
 * on the dark teal theme" — every one of the library's 34 colour tokens has
 * to swap together, which is exactly what `ThemeProvider` does. Reusing it
 * here means a story previews the same four themes a consuming app actually
 * ships, not an approximation of them.
 */
const themeEntries = Object.entries(THEMES);

const withTheme = (Story, context) => {
  const themeKey = context.globals.theme || DEFAULT_THEME;
  return (
    <ThemeProvider theme={themeKey} global={false}>
      <div className="min-h-[120px] p-6">
        <Story />
      </div>
    </ThemeProvider>
  );
};

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' surfaces violations in the panel without failing the build —
      // right while a new design system is still filling in stories, "error"
      // would turn every unfinished/in-progress story into a broken build.
      // Tighten to 'error' once every story here has been swept.
      test: "todo",
    },
    // Storybook's own background swatches would fight ThemeProvider's —
    // the canvas colour is a theme token, not a story-level choice.
    backgrounds: { disabled: true },
    layout: "fullscreen",
  },
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Which of the library's four themes to preview against",
      defaultValue: DEFAULT_THEME,
      toolbar: {
        icon: "paintbrush",
        items: themeEntries.map(([key, tokens]) => ({
          value: key,
          title: tokens.label,
          right: tokens.colorScheme === "dark" ? "🌙" : "☀️",
        })),
        dynamicTitle: true,
      },
    },
  },
  decorators: [withTheme],
};

export default preview;
