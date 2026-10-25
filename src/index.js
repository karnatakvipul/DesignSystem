
// Auto-injects theme CSS for every component — no manual CSS import needed
import './lib/autoInit.js';
import './index.css';

export * from './components/common';
export * from './components/feature';
export * from './components/layout';
export * from './pages';
export * from './theme';


export * from './data/mock.js';
export * from './lib/cn.js';
export * from './lib/columnWidth.js';
export * from './lib/licenseExpiry.js';
export * from './lib/exportUtils.js';
export * from './lib/useServerDataBinding.js';
export * from './lib/serverDataAdapter.js';

// ── Plumbing: everything an app needs between the components and a backend ──
export * from './lib/apiClient.js';
export * from './lib/authService.js';
export * from './lib/AuthProvider.jsx';
export * from './lib/createResourceService.js';
export * from './lib/useServerResource.js';
export * from './lib/useResource.js';
export * from './lib/useDistinctValues.js';
export * from './lib/PageFilterContext.jsx';
export * from './lib/useResourceFilters.jsx';
export * from './lib/mockServer.js';
export * from './lib/ServerDataProvider.jsx';