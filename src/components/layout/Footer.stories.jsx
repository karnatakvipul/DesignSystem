import { Footer } from "./Footer";

/**
 * The thin rule and copyright line at the bottom of the shell.
 *
 * With no children it prints a copyright notice using the current year, so the
 * common case needs no props at all. Anything you pass replaces that line
 * entirely.
 *
 * Optional — `MainLayout` renders no footer unless given one.
 */
const meta = {
  title: "Layout/Footer",
  component: Footer,
  tags: ["autodocs"],
  argTypes: {
    children: { control: "text", description: "Replaces the default copyright line." },
    className: { control: "text" },
  },
};

export default meta;

/** The default — current year, product name, no props needed. */
export const Playground = {};

export const CustomContent = {
  args: { children: "© 2026 Acme Corp — Internal use only" },
};

/** Children can be markup, not just text. */
export const WithLinks = {
  render: () => (
    <Footer>
      <div className="flex items-center justify-between">
        <span>© 2026 my Design System</span>
        <span className="flex gap-4">
          <a href="#privacy" className="hover:text-ink-primary">
            Privacy
          </a>
          <a href="#terms" className="hover:text-ink-primary">
            Terms
          </a>
          <a href="#support" className="hover:text-ink-primary">
            Support
          </a>
        </span>
      </div>
    </Footer>
  ),
};
