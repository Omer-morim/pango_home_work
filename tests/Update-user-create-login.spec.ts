import { test } from '@playwright/test';
import { credentials } from './config/credentials.js';
import { path } from './config/endpoints.js';
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

    await test.step('Admin login and shell verification', async () => {
      await login.goto();
      await login.login(credentials.adminUser, credentials.adminPassword);
      await dash.expectLoggedInShell();
    });

    await test.step('Create user and verify user listed', async () => {
      await users.addUser(newUser, newPass);
      await users.expectUserListed(newUser);
    });

    await test.step('Logout and verify protected route redirects to login', async () => {
      await dash.logoutViaUrl();
      await login.expectOnLoginPage();
      await page.goto(path('users'));
      await login.expectOnLoginPage();
    });

    await test.step('Login as the new user and verify shell', async () => {
      await login.goto();
      await login.login(newUser, newPass);
      await dash.expectLoggedInShell();
    });
  });

  test('new user cannot login with wrong password', async ({ page }) => {
    const login = new LoginPage(page);
    const dash = new DashboardPage(page);
    const users = new UsersPage(page);

    const newUser = `u_${Date.now()}`;
    const validPass = 'TempPass123!';
    const wrongPass = 'TempPass123!_wrong';

    await test.step('Create user as admin', async () => {
      await login.goto();
      await login.login(credentials.adminUser, credentials.adminPassword);
      await dash.expectLoggedInShell();
      await users.addUser(newUser, validPass);
      await users.expectUserListed(newUser);
    });

    await test.step('Logout and verify failed login with wrong password', async () => {
      await dash.logoutViaUrl();
      await login.expectOnLoginPage();
      await login.loginExpectFailure(newUser, wrongPass);
    });
  });
});
