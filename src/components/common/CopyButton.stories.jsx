import { CopyButton, CopyableText } from "./CopyButton";

const meta = {
  title: "Components/CopyButton",
  component: CopyButton,
  tags: ["autodocs"],
  args: {
    text: "2e811e27-c0fb-4898-8bf5-e9b0da5ad261",
  },
  parameters: { layout: "padded" },
};

export default meta;

export const Playground = {};

export const WithLabel = {
  args: { label: "Copy key" },
};

export const CopyableTextRow = {
  render: () => <CopyableText text="2e811e27-c0fb-4898-8bf5-e9b0da5ad261" />,
};
