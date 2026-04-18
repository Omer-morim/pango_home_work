import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { path } from '../../config/endpoints.js';
import { usersLocators } from './users.locators.js';

export class UsersPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(path('users'));
    await expect(this.page).toHaveURL(/\/users$/);
  }

  private addUserLink() {
    const { role, name } = usersLocators.list.addUserLink;
    return this.page.getByRole(role, { name });
  }

  async addUser(username: string, password: string): Promise<void> {
    await this.goto();
    await expect(this.addUserLink()).toBeVisible();
    await this.addUserLink().click();
    await this.page.waitForURL(/\/users\/add/);
    await expect(this.page.locator(usersLocators.addForm.username)).toBeVisible();
    await expect(this.page.locator(usersLocators.addForm.password)).toBeVisible();

    await this.page.locator(usersLocators.addForm.username).fill(username);
    await this.page.locator(usersLocators.addForm.password).fill(password);
    await this.page.locator(usersLocators.addForm.submit).click();
    await expect(this.page).toHaveURL(/\/users$/);
  }

  async expectUserListed(username: string): Promise<void> {
    await this.goto();
    await expect(this.page.locator(usersLocators.list.rowForUsername(username))).toBeVisible();
  }
}
