---
layout: home

hero:
  name: "my Design System"
  text: "The design system behind SLS"
  tagline: React components, design tokens, and the plumbing between them and a backend.
  actions:
    - theme: brand
      text: Build an app with it
      link: /building-an-app
    - theme: alt
      text: The design system
      link: /design-system
    - theme: alt
      text: Component reference
      link: /components

features:
  - title: Tokens, not values
    details: Radius, control height, type and elevation named for what a thing is rather than how big it is — so a button lines up with the input beside it and a panel reads as containing its controls.
  - title: Four themes, one contract
    details: Every theme defines every colour token, checked on build. Body text is held to 4.5:1 against whatever it sits on.
  - title: Server-side by default
    details: Paging, sorting, search and filtering done by the database, with superseded requests cancelled and rows kept on screen while the next page loads.
  - title: Verified, not asserted
    details: Every public export is checked reachable from the built bundle, the tarball is installed into a fresh project on every push, and axe runs over the components an app cannot avoid.
