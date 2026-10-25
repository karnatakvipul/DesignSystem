import * as React from "react";
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "./Button";

/**
 * Enterprise Error Boundary component that catches JavaScript errors anywhere
 * in its child component tree, logs them, and displays a fallback UI instead of crashing the app.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === "function"
          ? this.props.fallback({
              error: this.state.error,
              reset: this.handleReset,
            })
          : this.props.fallback;
      }

      const title = this.props.title || "Something went wrong";
      const description =
        this.props.description ||
        "An unexpected error occurred in this component. You can retry loading or clear filters.";

      return (
        <div
          className={cn(
            "flex flex-col items-center justify-center p-6 text-center rounded-surface border border-status-offline/30 bg-status-offline-bg/20 shadow-sm my-2 w-full",
            this.props.className
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-pill bg-status-offline-bg text-status-offline mb-3">
            <AlertTriangle size={24} />
          </div>

          <h3 className="font-secondary text-title font-bold text-ink-primary mb-1">
            {title}
          </h3>

          <p className="text-body-sm text-ink-secondary max-w-md mb-4 leading-relaxed">
            {description}
          </p>

          <div className="flex items-center gap-3 mb-3">
            <Button
              variant="danger"
              size="sm"
              icon={<RefreshCw size={14} />}
              onClick={this.handleReset}
            >
              Try Again
            </Button>

            <button
              type="button"
              onClick={() =>
                this.setState((s) => ({ showDetails: !s.showDetails }))
              }
              className="inline-flex items-center gap-1 text-body-sm text-ink-muted hover:text-ink-primary transition-colors cursor-pointer"
            >
              <span>{this.state.showDetails ? "Hide Error Logs" : "View Error Logs"}</span>
              {this.state.showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {this.state.showDetails && (
            <div className="w-full max-w-xl text-left bg-chrome-deep/90 border border-card-border rounded-control p-3 mt-2 overflow-x-auto text-caption font-mono text-status-offline leading-normal">
              <p className="font-bold mb-1">
                {this.state.error && this.state.error.toString()}
              </p>
              {this.state.errorInfo && (
                <pre className="whitespace-pre-wrap opacity-80 text-[10px]">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
