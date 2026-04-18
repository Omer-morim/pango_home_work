
// Test credentials.

export const credentials = {
  adminUser: process.env.ADMIN_USER ?? 'admin',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'password',
} as const;
