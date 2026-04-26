import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { path } from '../../config/endpoints.js';
import { loginLocators } from './login.locators.js';

export class LoginPage {
  constructor(private readonly page: Page) {}

  private username() {
    return this.page.locator(loginLocators.ids.username);
  }

  private password() {
    return this.page.locator(loginLocators.ids.password);
  }

  private submit() {
    return this.page.getByRole('button', loginLocators.submit);
  }

  async goto(): Promise<void> {
    await this.page.goto(path('login'));
    await this.expectOnLoginPage();
  }

  /** Assert login route and primary submit control. */
  async expectOnLoginPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/login/);
    await expect(this.submit()).toBeVisible();
  }

  async login(username: string, password: string): Promise<void> {
    await this.username().fill(username);
    await this.password().fill(password);
    await this.submit().click();
    await expect(this.page).not.toHaveURL(/\/login/);
  }

  async loginExpectFailure(username: string, password: string): Promise<void> {
    await this.username().fill(username);
    await this.password().fill(password);
    await this.submit().click();
    await this.expectOnLoginPage();
  }

  async expectAuthenticated(): Promise<void> {
    await expect(this.page).not.toHaveURL(/\/login/);
  }
}
