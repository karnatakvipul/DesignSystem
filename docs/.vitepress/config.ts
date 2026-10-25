import { defineConfig } from 'vitepress'

// The content pages are generated from the markdown at the repository root by
// scripts/collect-docs.mjs — those files are what npm publishes and what GitHub
// renders, so they stay canonical and this site is built from them rather than
// keeping a second copy that drifts.
export default defineConfig({
  title: "my Design System",
  description: "The design system and component library behind SLS.",
  themeConfig: {
    nav: [
      { text: 'Building an app', link: '/building-an-app' },
      { text: 'Design system', link: '/design-system' },
      { text: 'Components', link: '/components' },
      { text: 'Changelog', link: '/changelog' },
    ],

    sidebar: [
      {
        text: 'Getting started',
        items: [
          { text: 'Building an app', link: '/building-an-app' },
          { text: 'Contributing', link: '/contributing' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Design system', link: '/design-system' },
          { text: 'Components', link: '/components' },
          { text: 'Changelog', link: '/changelog' },
        ],
      },
    ],

    outline: [2, 3],
  },
})
