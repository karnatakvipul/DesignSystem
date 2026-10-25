import { Loader } from "./Loader";

const meta = {
  title: "Components/Loader",
  component: Loader,
  tags: ["autodocs"],
};

export default meta;

export const Inline = {
  args: { label: "Fetching the records..." },
};

export const CustomLabel = {
  args: { label: "Loading license history…" },
};

/** `fullPage` fixes to the viewport, so it deliberately covers the whole canvas here — that's the real behaviour. */
export const FullPage = {
  args: { fullPage: true, label: "Checking your session..." },
  parameters: { layout: "fullscreen" },
};
