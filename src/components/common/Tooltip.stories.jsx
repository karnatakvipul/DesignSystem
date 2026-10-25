import { Button } from "./Button";
import { Tooltip } from "./Tooltip";

const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  argTypes: {
    position: { control: "select", options: ["top", "bottom", "left", "right"] },
    trigger: { control: "select", options: ["hover", "click", "focus", "manual"] },
  },
  args: {
    content: "Deletes this license permanently.",
    position: "top",
  },
  parameters: { layout: "padded" },
};

export default meta;

export const Playground = {
  render: (args) => (
    <div className="flex justify-center py-16">
      <Tooltip {...args}>
        <Button variant="outline">Hover me</Button>
      </Tooltip>
    </div>
  ),
};

export const Positions = {
  render: () => (
    <div className="flex justify-center gap-10 py-16">
      {["top", "bottom", "left", "right"].map((position) => (
        <Tooltip key={position} content={`Positioned ${position}`} position={position}>
          <Button variant="outline" size="sm">
            {position}
          </Button>
        </Tooltip>
      ))}
    </div>
  ),
};

export const OnlyIfOverflow = {
  render: () => (
    <div className="flex flex-col gap-3 max-w-[220px]">
      <p className="text-body-sm text-ink-muted">Both rows show the same tooltip — only the truncated one displays it.</p>
      <Tooltip content="This line does not need a tooltip." onlyIfOverflow>
        <div className="truncate text-body">Short line</div>
      </Tooltip>
      <Tooltip content="This is the full, untruncated text of a much longer license name that got cut off." onlyIfOverflow>
        <div className="truncate text-body">
          This is the full, untruncated text of a much longer license name that got cut off.
        </div>
      </Tooltip>
    </div>
  ),
};
