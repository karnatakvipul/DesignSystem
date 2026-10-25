import * as React from "react";
import { Search, Boxes, Building2, Users as UsersIcon, CornerDownLeft } from "lucide-react";
import { Modal } from "./Modal";
import { Badge } from "./Badge";

/**
 * Global search jump-to-anything palette (opens on Ctrl+K / ⌘K).
 */
export function CommandPalette({
  hideTrigger = false,
  onJumpToSearch,
  onNavigate,
  loadData,
  accounts: propAccounts,
  applications: propApplications,
  users: propUsers,
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [loaded, setLoaded] = React.useState(false);
  const [accounts, setAccounts] = React.useState(propAccounts || []);
  const [applications, setApplications] = React.useState(propApplications || []);
  const [users, setUsers] = React.useState(propUsers || []);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (propAccounts) setAccounts(propAccounts);
    if (propApplications) setApplications(propApplications);
    if (propUsers) setUsers(propUsers);
  }, [propAccounts, propApplications, propUsers]);

  React.useEffect(() => {
    function onKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  React.useEffect(() => {
    if (!open || loaded || !loadData) return;
    Promise.resolve(loadData()).then(([a, app, u]) => {
      if (a) setAccounts(Array.isArray(a) ? a : a.items || []);
      if (app) setApplications(Array.isArray(app) ? app : app.items || []);
      if (u) setUsers(Array.isArray(u) ? u : u.items || []);
      setLoaded(true);
    }).catch(() => {});
  }, [open, loaded, loadData]);

  React.useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  const close = React.useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  function goTo(path) {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== "undefined") {
      window.location.href = path;
    }
    close();
  }

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const appMatches = applications
      .filter((a) => `${a.name || ""} ${a.clientId || ""} ${a.description || ""}`.toLowerCase().includes(q))
      .slice(0, 6)
      .map((a) => ({
        key: `app-${a.id || a.clientId}`,
        group: "Applications",
        icon: <Boxes size={15} />,
        title: a.name || a.clientId,
        subtitle: a.clientId,
        status: a.status,
        go: () => goTo(`/applications/${a.id || a.clientId}`),
      }));

    const accountMatches = accounts
      .filter((a) => `${a.name || ""} ${a.shortCode || ""}`.toLowerCase().includes(q))
      .slice(0, 6)
      .map((a) => ({
        key: `acct-${a.id}`,
        group: "Accounts",
        icon: <Building2 size={15} />,
        title: a.name,
        subtitle: a.shortCode,
        status: a.status,
        go: () => goTo(`/accounts/${a.id}`),
      }));

    const userMatches = users
      .filter((u) => `${u.username || ""} ${u.firstName || ""} ${u.lastName || ""} ${u.email || ""}`.toLowerCase().includes(q))
      .slice(0, 6)
      .map((u) => ({
        key: `user-${u.id || u.username}`,
        group: "Users",
        icon: <UsersIcon size={15} />,
        title: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username,
        subtitle: u.email,
        status: u.status,
        go: () => {
          if (onJumpToSearch) onJumpToSearch("/users", u.username);
          else goTo("/users");
          close();
        },
      }));

    return [...appMatches, ...accountMatches, ...userMatches];
  }, [query, accounts, applications, users]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleKeyDown(e) {
    if (results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      results[activeIndex]?.go();
    }
  }

  let renderedGroup = null;

  return (
    <>
      {!hideTrigger && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-10 w-full items-center gap-2 rounded-control border border-card-border bg-input px-2.5 text-body-sm text-ink-muted transition-colors hover:border-accent/60 cursor-pointer"
        >
          <Search size={14} className="shrink-0" />
          <span className="flex-1 truncate text-left">Search accounts, applications, users…</span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border border-card-border bg-card px-1.5 py-0.5 text-[10px] font-medium shrink-0 select-none">
            Ctrl+K
          </kbd>
        </button>
      )}

      <Modal open={open} onClose={close} size="lg">
        <div className="flex items-center gap-2 border-b border-card-border pb-3">
          <Search size={16} className="shrink-0 text-ink-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search accounts, applications, users…"
            className="w-full min-w-0 bg-transparent text-body text-ink-primary placeholder:text-ink-muted focus:outline-none"
          />
        </div>

        <div className="-mx-1 mt-2 max-h-[50vh] overflow-y-auto">
          {query.trim() === "" ? (
            <p className="px-1 py-6 text-center text-body-sm text-ink-muted">
              Type to jump to any account, application, or user.
            </p>
          ) : results.length === 0 ? (
            <p className="px-1 py-6 text-center text-body-sm text-ink-muted">No matches for &ldquo;{query}&rdquo;.</p>
          ) : (
            results.map((r, i) => {
              const showHeading = r.group !== renderedGroup;
              renderedGroup = r.group;
              return (
                <React.Fragment key={r.key}>
                  {showHeading && (
                    <div className="px-2 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      {r.group}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={r.go}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`flex w-full items-center gap-3 rounded-control px-2 py-2 text-left transition-colors cursor-pointer ${
                      i === activeIndex ? "bg-accent-muted" : "hover:bg-canvas"
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-accent-muted text-accent">
                      {r.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body-sm font-medium text-ink-primary">{r.title}</span>
                      <span className="block truncate text-xs text-ink-muted">{r.subtitle}</span>
                    </span>
                    {r.status && <Badge tone={r.status === "Active" ? "online" : "offline"}>{r.status}</Badge>}
                    {i === activeIndex && <CornerDownLeft size={14} className="shrink-0 text-ink-muted" />}
                  </button>
                </React.Fragment>
              );
            })
          )}
        </div>
      </Modal>
    </>
  );
}
