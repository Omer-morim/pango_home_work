
// Pango — single source for **BASE_URL** + relative **paths**.

//  - Set **`BASE_URL`** (no trailing slash), e.g. `http://localhost:5000`.
// - Use **`path('login')`** with Playwright `use.baseURL` for `page.goto()`.
// - Use **`appUrl('history')`** when  need a full URL string (reports, logs).
 
function normalizeBase(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

const base = normalizeBase(process.env.BASE_URL ?? 'http://localhost:5000');

export const endpoints = {
  //  Origin only (no trailing slash). Mirrors `use.baseURL` in playwright.config. 
  baseURL: base,
  // Relative paths (leading `/`). 
  paths: {
    login: '/login',
    dashboard: '/',
    history: '/history',
    users: '/users',
  // Add-user form route (not the `/users` list). 
    usersAdd: '/users/add',
    logout: '/logout',
  },
} as const;

// Relative path for `page.goto()` when `baseURL` is set in Playwright config. 
export function path(p: keyof typeof endpoints.paths): string {
  return endpoints.paths[p];
}

// Full URL: `baseURL` + path (e.g. paste into browser). 
export function appUrl(route: keyof typeof endpoints.paths): string {
  return `${endpoints.baseURL}${endpoints.paths[route]}`;
}
