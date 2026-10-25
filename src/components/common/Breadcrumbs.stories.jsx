import { Breadcrumbs } from "./Breadcrumbs";

const meta = {
  title: "Components/Breadcrumbs",
  component: Breadcrumbs,
  tags: ["autodocs"],
  args: {
    items: [
      { label: "Licenses", href: "#" },
      { label: "Aaxis Nano", href: "#" },
      { label: "Reflashing Issue" },
    ],
  },
};

export default meta;

export const Playground = {};

export const TwoLevels = {
  args: {
    items: [{ label: "Licenses", href: "#" }, { label: "Reflashing Issue" }],
  },
};

export const NoHomeIcon = {
  args: { showHomeIcon: false },
};
