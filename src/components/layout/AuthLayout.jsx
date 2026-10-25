import * as React from "react";
import { ShieldCheck, RefreshCcw, Users2 } from "lucide-react";
import { cn } from "../../lib/cn";

const DEFAULT_FEATURES = [
  { icon: <ShieldCheck size={16} />, label: "Every license tracked in one place" },
  { icon: <RefreshCcw size={16} />, label: "Renewals and alerts handled automatically" },
  { icon: <Users2 size={16} />, label: "Role-based access for your whole team" },
];

/**
 * Full-viewport auth screen shell used by LoginForm / LoginPasswordForm (and any
 * custom sign-in/sign-up/reset screen you build). Renders a decorative brand
 * panel on the left (large viewports only) next to a centered form card.
 *
 * Purely presentational — it has no auth logic of its own. Every color here
 * comes from the active theme's CSS variables (bg-canvas/bg-chrome/bg-card/
 * text-accent/etc.), so it automatically matches whichever of the library's
 * themes the host app has active, with zero extra config.
 */
function AuthLayout({
  logo,
  children,
  className,
  brandName = "my Design System",
  title = "Manage every software license from one screen.",
  subtitle = "A focused workspace for tracking licenses, renewals, and access across your organization.",
  features = DEFAULT_FEATURES,
  showBrandPanel = true,
  topRight,
  footer,
}) {
  const brandMark = logo ?? (
    <span className="inline-flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-surface bg-accent text-white shadow-sm shadow-accent/30">
        <ShieldCheck size={18} />
      </span>
      <span className="font-secondary text-xl font-bold tracking-tight">{brandName}</span>
    </span>
  );

  return (
    <div className={cn("flex min-h-screen w-full bg-canvas", className)}>
      {/* Decorative brand panel — desktop/large screens only */}
      {showBrandPanel && (
        <div className="relative hidden w-[44%] max-w-xl shrink-0 overflow-hidden bg-chrome lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
          {/* Ambient decoration: blurred accent blobs + faint dot grid, pure CSS */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-pill bg-accent/30 blur-3xl" />
            <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-pill bg-accent-light/20 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
                backgroundSize: "22px 22px",
                color: "var(--text-on-chrome)",
              }}
            />
          </div>

          {/* The same mark as the compact one below, in the theme's on-chrome
              colour. This panel used to draw the stock shield regardless of
              what `logo` was set to, so an app supplying its own brand got it
              on mobile and the library's placeholder on every desktop. */}
          <div className="relative flex items-center gap-2.5 text-ink-onchrome">
            {logo ?? (
              <>
                <span className="flex h-9 w-9 items-center justify-center rounded-surface bg-[var(--text-on-chrome)]/10 text-ink-onchrome ring-1 ring-[var(--text-on-chrome)]/20 backdrop-blur-sm">
                  <ShieldCheck size={18} />
                </span>
                <span className="font-secondary text-xl font-bold tracking-tight">{brandName}</span>
              </>
            )}
          </div>

          <div className="relative mt-auto max-w-md">
            <h1 className="font-secondary text-3xl font-bold leading-tight text-ink-onchrome xl:text-4xl">
              {title}
            </h1>
            <p className="mt-4 text-body leading-relaxed text-ink-onchrome/70">{subtitle}</p>

            {features?.length > 0 && (
              <ul className="mt-8 flex flex-col gap-3.5">
                {features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-body text-[var(--text-on-chrome)]/85">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-[var(--text-on-chrome)]/10 text-ink-onchrome ring-1 ring-[var(--text-on-chrome)]/15">
                      {f.icon}
                    </span>
                    {f.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="relative text-body-sm text-ink-onchrome/50">Built for enterprise software license management.</p>
        </div>
      )}

      {/* Form panel */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        {topRight && <div className="absolute right-4 top-4 sm:right-6 sm:top-6">{topRight}</div>}

        {/* Compact logo shown only when the brand panel is hidden (mobile, or showBrandPanel=false) */}
        {/* On the light canvas rather than the dark panel, so the colour is set
            here and a mark drawn in `currentColor` reads correctly in both. */}
        <div className={cn("mb-8 flex justify-center text-ink-primary", showBrandPanel && "lg:hidden")}>
          {brandMark}
        </div>

        <div className="w-full max-w-md rounded-overlay border border-card-border bg-card p-8 shadow-xl shadow-black/5 sm:p-9">
          {children}
        </div>

        {footer && <div className="mt-6 text-center text-body-sm text-ink-muted">{footer}</div>}
      </div>
    </div>
  );
}

export {
  AuthLayout
};
