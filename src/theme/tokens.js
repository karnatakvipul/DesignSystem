const CSS_VAR_MAP = {
  chromeBg: "--chrome-bg",
  chromeDeep: "--chrome-deep",
  canvasBg: "--canvas-bg",
  cardBg: "--card-bg",
  cardBorder: "--card-border",
  accentPrimary: "--accent-primary",
  accentLight: "--accent-light",
  accentMutedBg: "--accent-muted-bg",
  accentBorder: "--accent-border",
  textPrimary: "--text-primary",
  textSecondary: "--text-secondary",
  textMuted: "--text-muted",
  textOnChrome: "--text-on-chrome",
  iconIdle: "--icon-idle",
  iconActive: "--icon-active",
  statusOnline: "--status-online",
  statusOnlineBg: "--status-online-bg",
  statusWarn: "--status-warn",
  statusWarnBg: "--status-warn-bg",
  statusOffline: "--status-offline",
  statusOfflineBg: "--status-offline-bg",
  liveBg: "--live-bg",
  liveText: "--live-text",
  sidebarBg: "--sidebar-bg",
  sidebarBorder: "--sidebar-border",
  topbarBorder: "--topbar-border",
  navActive: "--nav-active",
  navActiveBg: "--nav-active-bg",
  navActiveBorder: "--nav-active-border",
  tagBg: "--tag-bg",
  tagText: "--tag-text",
  tagBorder: "--tag-border",
  inputBg: "--input-bg",
  colorScheme: "--color-scheme"
};


const THEMES = {
  "slate-navy": {
    label: "Light Navy",
    description: "Light workspace, navy sidebar",
    chromeBg: "#0d1b2e",
    chromeDeep: "#0a1626",
    canvasBg: "#f4f6f9",
    cardBg: "#ffffff",
    cardBorder: "#e2e8f0",
    accentPrimary: "#1d4ed8",
    accentLight: "#60a5fa",
    accentMutedBg: "#eff6ff",
    accentBorder: "#bfdbfe",
    textPrimary: "#0d1b2e",
    // Darkened for legibility on the white card. At #718096 and #a0aec0 these
    // measured 4.02:1 and 2.26:1 — below the 4.5:1 body text needs, and the
    // worst of the four themes. They keep the blue-grey cast the palette is
    // built on, and the gap between them is widened so the three text weights
    // still read as a hierarchy rather than three similar greys.
    textSecondary: "#4a5a6e",
    textMuted: "#647488",
    textOnChrome: "#e8edf5",
    iconIdle: "#5d8ab8",
    iconActive: "#60a5fa",
    statusOnline: "#1a9b5a",
    statusOnlineBg: "#f0fdf4",
    // Darkened from #e07b00, which measured 3.00:1 on this theme's white card —
    // under the 4.5:1 body text needs, and the only warn colour of the four
    // themes that failed outright. Now 5.77:1, and still 4.64:1 once the row
    // behind it is tinted for a licence about to expire, which is where this
    // colour is read most often.
    statusWarn: "#9a5400",
    statusWarnBg: "#fffbeb",
    statusOffline: "#c53030",
    statusOfflineBg: "#fff5f5",
    liveBg: "#eff6ff",
    liveText: "#1d4ed8",
    barColors: ["#1d4ed8", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe", "#eff6ff"],
    sidebarBg: "#0d1b2e",
    // A lifted navy rather than transparent. This was the only theme with no
    // edge at all, so the dark chrome and the light canvas met with nothing
    // between them and the sidebar read as a slab rather than a panel.
    sidebarBorder: "#1c3049",
    topbarBorder: "#1c3049",

    // The selected nav item was `accentPrimary` (#1d4ed8) — a deep blue meant
    // for light surfaces — sitting on the dark navy sidebar, measuring 2.58:1.
    // You could barely tell which page you were on. The two other dark-chrome
    // themes already resolve this by using their *light* accent here, and this
    // now follows them: #60a5fa reaches 6.79:1 on the same ground.
    navActive: "#60a5fa",
    // Alpha lifted with it. Eight percent of a dark blue over dark navy was
    // effectively invisible; the same fraction of a light blue reads as a
    // genuine highlight.
    navActiveBg: "rgba(96,165,250,0.14)",
    navActiveBorder: "#60a5fa",
    tagBg: "#eff6ff",
    tagText: "#1d4ed8",
    tagBorder: "#bfdbfe",
    inputBg: "#f4f6f9",
    colorScheme: "light"
  },
  "arctic-white": {
    label: "Light",
    description: "Bright surfaces throughout",
    chromeBg: "#ffffff",
    chromeDeep: "#f8fafc",
    canvasBg: "#f1f5f9",
    cardBg: "#ffffff",
    cardBorder: "#e2e8f0",
    accentPrimary: "#2563eb",
    accentLight: "#3b82f6",
    accentMutedBg: "#eff6ff",
    accentBorder: "#bfdbfe",
    textPrimary: "#0f172a",
    textSecondary: "#64748b",
    textMuted: "#94a3b8",
    textOnChrome: "#0f172a",
    iconIdle: "#94a3b8",
    iconActive: "#2563eb",
    statusOnline: "#15803d",
    statusOnlineBg: "#f0fdf4",
    // Darkened from #b45309. It cleared 4.5:1 on the plain card but fell to
    // 4.08:1 on a warn-tinted row, and the countdown text that sits there is
    // the whole point of the tint. 5.95:1 and 4.77:1 respectively.
    statusWarn: "#a04c08",
    statusWarnBg: "#fffbeb",
    statusOffline: "#b91c1c",
    statusOfflineBg: "#fef2f2",
    liveBg: "#f0fdf4",
    liveText: "#15803d",
    barColors: ["#0ea5e9", "#38bdf8", "#7dd3fc", "#bae6fd", "#e0f2fe", "#f0f9ff", "#f8fafc"],
    sidebarBg: "#ffffff",
    sidebarBorder: "#e2e8f0",
    topbarBorder: "#e5e7eb",
    navActive: "#2563eb",
    navActiveBg: "#eff6ff",
    navActiveBorder: "#2563eb",
    tagBg: "#eff6ff",
    tagText: "#2563eb",
    tagBorder: "#bfdbfe",
    inputBg: "#f8fafc",
    colorScheme: "light"
  },
  "carbon-pro": {
    label: "Dark",
    description: "Dark surfaces, blue accent",
    chromeBg: "#161b22",
    chromeDeep: "#0d1117",
    canvasBg: "#1c2128",
    cardBg: "#21262d",
    cardBorder: "#30363d",
    accentPrimary: "#58a6ff",
    accentLight: "#79c0ff",
    accentMutedBg: "#0d2a1f",
    accentBorder: "#30363d",
    textPrimary: "#e6edf3",
    textSecondary: "#c9d1d9",
    textMuted: "#8b949e",
    textOnChrome: "#e6edf3",
    iconIdle: "#484f58",
    iconActive: "#58a6ff",
    statusOnline: "#34d399",
    statusOnlineBg: "#0d2a1f",
    statusWarn: "#fbbf24",
    statusWarnBg: "#1f1a00",
    statusOffline: "#f87171",
    statusOfflineBg: "#1f0a0a",
    liveBg: "#0d2a1f",
    liveText: "#34d399",
    barColors: ["#58a6ff", "#388bfd", "#1f6feb", "#0d419d", "#0a2d6e", "#071e4a", "#040f2b"],
    sidebarBg: "#161b22",
    sidebarBorder: "#21262d",
    topbarBorder: "#30363d",
    navActive: "#58a6ff",
    navActiveBg: "rgba(88,166,255,0.08)",
    navActiveBorder: "#58a6ff",
    tagBg: "#21262d",
    tagText: "#58a6ff",
    tagBorder: "#30363d",
    inputBg: "#21262d",
    colorScheme: "dark"
  },
  "narnix-edge": {
    label: "Dark Teal",
    description: "Dark surfaces, teal accent",
    chromeBg: "#061828",
    chromeDeep: "#040f1a",
    canvasBg: "#0b1e30",
    cardBg: "#112035",
    cardBorder: "#1e3a55",
    accentPrimary: "#00c9a7",
    accentLight: "#00ddb8",
    accentMutedBg: "#0a2240",
    accentBorder: "#1e3a55",
    textPrimary: "#daeaf8",
    textSecondary: "#a8c4d9",
    textMuted: "#4a7fa5",
    textOnChrome: "#daeaf8",
    iconIdle: "#2e5470",
    iconActive: "#00c9a7",
    statusOnline: "#00c9a7",
    statusOnlineBg: "#072219",
    statusWarn: "#f5a623",
    statusWarnBg: "#1e1200",
    statusOffline: "#e05252",
    statusOfflineBg: "#1a0808",
    liveBg: "#072219",
    liveText: "#00c9a7",
    barColors: ["#00ddb8", "#00c9a7", "#00b898", "#00a88a", "#018870", "#016a55", "#015a4a"],
    sidebarBg: "#061828",
    sidebarBorder: "#0e2236",
    topbarBorder: "#0e2236",
    navActive: "#00c9a7",
    navActiveBg: "rgba(0,201,167,0.08)",
    navActiveBorder: "#00c9a7",
    tagBg: "#0a2240",
    tagText: "#4a9ecf",
    tagBorder: "#1e3a55",
    inputBg: "#0b1e30",
    colorScheme: "dark"
  },
  
 
};

const DEFAULT_THEME = "arctic-white";


const THEME_ALIASES = {
  light: "arctic-white",
  dark: "carbon-pro"
};

function resolveThemeKey(key) {
  if (THEMES[key]) return key;
  return THEME_ALIASES[key] ?? DEFAULT_THEME;
}

function applyTheme(el, key) {
  if (!el) return;
  const validKey = resolveThemeKey(key);
  const tokens = THEMES[validKey] || THEMES[DEFAULT_THEME];
  if (!tokens) return;
  Object.keys(CSS_VAR_MAP).forEach((tokenKey) => {
    el.style.setProperty(CSS_VAR_MAP[tokenKey], tokens[tokenKey]);
  });
  if (tokens.barColors) {
    tokens.barColors.forEach((color, i) => {
      el.style.setProperty(`--bar-color-${i}`, color);
    });
  }
  if (tokens.colorScheme) {
    el.style.colorScheme = tokens.colorScheme;
  }
  el.dataset.theme = validKey;
}

export {
  CSS_VAR_MAP,
  DEFAULT_THEME,
  THEME_ALIASES,
  THEMES,
  resolveThemeKey,
  applyTheme
};