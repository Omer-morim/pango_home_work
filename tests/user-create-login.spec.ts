import { test } from '@playwright/test';
import { credentials } from './config/credentials.js';
import { LoginPage } from './pages/login/LoginPage.js';
import { DashboardPage } from './pages/dashboard/DashboardPage.js';
import { UsersPage } from './pages/users/UsersPage.js';

test.describe('User creation + re-login (POM)', () => {
  test('admin creates user → logout → new user logs in', async ({ page }) => {
    const login = new LoginPage(page);
    const dash = new DashboardPage(page);
    const users = new UsersPage(page);

    const newUser = `u_${Date.now()}`;
    const newPass = 'TempPass123!';

    // 1) Admin login
    await login.goto();
    await login.login(credentials.adminUser, credentials.adminPassword);
    await dash.expectLoggedInShell();

    // 2) Create user — list, form on /users/add, return to list with row
    await users.goto();
    await users.addUser(newUser, newPass);
    await users.expectUserListed(newUser);

    // 3) Logout — must land on login
    await dash.logoutViaUrl();
    await login.expectOnLoginPage();

    // 4) New user login — shell proves session
    await login.goto();
    await login.login(newUser, newPass);
    await dash.expectLoggedInShell();
  });
});
