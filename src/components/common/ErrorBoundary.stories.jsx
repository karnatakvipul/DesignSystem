import * as React from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { Button } from "./Button";

/** Throws on demand, so the boundary has something real to catch. */
function Bomb({ boom }) {
  if (boom) throw new Error("Cannot read properties of undefined (reading 'account')");
  return <p className="text-body-sm text-ink-primary">Rendered fine — nothing thrown.</p>;
}

/**
 * Catches a render error anywhere below it and shows a recoverable panel
 * instead of taking the whole app down with a blank screen.
 *
 * Wrap it around each routed page, keyed by pathname, so one page failing to
 * render never blanks the shell around it — the sidebar and header stay usable
 * and the user can navigate away.
 *
 * Note that a React error boundary only catches errors thrown **during
 * render**. It does not catch errors in event handlers, in `setTimeout`, or
 * inside promises — those need a `try`/`catch` where they happen.
 */
const meta = {
  title: "Components/ErrorBoundary",
  component: ErrorBoundary,
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text", description: 'Heading on the fallback panel. Defaults to "Something went wrong".' },
    description: { control: "text", description: "Explanatory line under the heading." },
    fallback: {
      control: false,
      description:
        "Replaces the built-in panel entirely. Either a node, or `({ error, errorInfo, reset }) => node`.",
    },
    onError: { action: "error caught", description: "`(error, errorInfo)` — hook for your logger." },
    onReset: { action: "reset", description: "Called after Try Again clears the error state." },
    className: { control: "text" },
    children: { control: false },
  },
};

export default meta;

/** Press the button to throw during the next render and trip the boundary. */
export const Playground = {
  render: function Render(args) {
    const [boom, setBoom] = React.useState(false);
    return (
      <div className="flex flex-col gap-3">
        <Button variant="danger" size="sm" onClick={() => setBoom(true)} className="self-start">
          Throw a render error
        </Button>
        <ErrorBoundary {...args} key={boom ? "boom" : "ok"} onReset={() => setBoom(false)}>
          <Bomb boom={boom} />
        </ErrorBoundary>
      </div>
    );
  },
};

/** The default panel, already tripped. "Show details" reveals the stack. */
export const Caught = {
  render: (args) => (
    <ErrorBoundary {...args}>
      <Bomb boom />
    </ErrorBoundary>
  ),
};

/** `title` and `description` let each page explain the failure in its own terms. */
export const CustomCopy = {
  render: () => (
    <ErrorBoundary
      title="This page failed to render"
      description="Something went wrong while displaying this screen. Retry, or pick another page from the sidebar."
    >
      <Bomb boom />
    </ErrorBoundary>
  ),
};

/** A function `fallback` receives `error` and a `reset` callback, replacing the panel outright. */
export const CustomFallback = {
  render: () => (
    <ErrorBoundary
      fallback={({ error, reset }) => (
        <div className="rounded-surface border border-status-offline/30 bg-status-offline/10 p-4">
          <p className="text-body-sm font-semibold text-status-offline">Licence table unavailable</p>
          <p className="mt-1 font-mono text-body-sm text-ink-secondary">{error?.message}</p>
          <Button size="sm" variant="secondary" className="mt-3" onClick={reset}>
            Reload the table
          </Button>
        </div>
      )}
    >
      <Bomb boom />
    </ErrorBoundary>
  ),
};

/** With nothing thrown, the boundary is invisible and renders its children untouched. */
export const NoError = {
  render: () => (
    <ErrorBoundary>
      <Bomb boom={false} />
    </ErrorBoundary>
  ),
};
