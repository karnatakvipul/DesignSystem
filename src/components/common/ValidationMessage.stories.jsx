import { ValidationMessage } from "./ValidationMessage";

/**
 * The inline error line beneath a form control.
 *
 * `FormGroup` renders one for you whenever it is given an `error`, so reach
 * for this directly only when validating something that is not a single
 * field — a group of checkboxes, or a whole step of a wizard.
 */
const meta = {
  title: "Components/Forms/ValidationMessage",
  component: ValidationMessage,
  tags: ["autodocs"],
  argTypes: {
    children: { control: "text", description: "The message. Renders nothing when empty." },
    className: { control: "text" },
  },
  args: {
    children: "Select at least one product before searching.",
  },
};

export default meta;

export const Playground = {};

/** Nothing renders for an empty message, so a conditional wrapper isn't needed at the call site. */
export const EmptyRendersNothing = {
  render: () => (
    <div className="flex flex-col gap-2">
      <ValidationMessage>A real message renders.</ValidationMessage>
      <ValidationMessage>{""}</ValidationMessage>
      <span className="text-body-sm text-ink-muted">(an empty message renders nothing above this line)</span>
    </div>
  ),
};
