import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { path } from '../../config/endpoints.js';
import { dashboardLocators } from './dashboard.locators.js';

export class DashboardPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(path('dashboard'));
    await expect(this.startParkingButton()).toBeVisible();
  }

  private carPlate(): Locator {
    const { role, name, fallback } = dashboardLocators.fields.carPlate;
    return this.page.getByRole(role, { name }).or(this.page.locator(fallback));
  }

  private slot(): Locator {
    const { role, name, fallback } = dashboardLocators.fields.slot;
    return this.page.getByRole(role, { name }).or(this.page.locator(fallback));
  }

  private imageInput(): Locator {
    return this.page.locator(dashboardLocators.fields.image);
  }

  private startParkingButton() {
    return this.page.getByRole('button', dashboardLocators.fields.startParking);
  }

  private rowForPlate(plate: string): Locator {
    return this.page.locator(dashboardLocators.activeTable.body).locator('tr', { hasText: plate });
  }

  async startParking(params: { plate: string; slot: string; imagePath?: string }): Promise<void> {
    await this.carPlate().fill(params.plate);
    await this.slot().fill(params.slot);
    if (params.imagePath) {
      await this.imageInput().setInputFiles(params.imagePath);
    }
    await this.startParkingButton().click();
  }

  async expectActiveRowVisible(plate: string): Promise<void> {
    await expect(this.rowForPlate(plate)).toBeVisible();
    await expect(this.rowForPlate(plate).getByRole('button', dashboardLocators.endSessionButton)).toBeVisible();
  }

  async endParkingForPlate(plate: string): Promise<void> {
    const endBtn = this.rowForPlate(plate).getByRole('button', dashboardLocators.endSessionButton);
    await expect(endBtn).toBeEnabled();
    await endBtn.click();
  }

  async expectActiveRowGone(plate: string): Promise<void> {
    await expect(this.rowForPlate(plate)).toHaveCount(0);
  }

  async expectValidationMessageVisible(
    message: RegExp = /invalid|error|must|exactly|digits|license|plate|slot|upload|image|warning|failed|שגיאה|חניות/i,
  ): Promise<void> {
    const feedback = this.page.locator('.alert, .invalid-feedback, [role="alert"], .text-danger');
    await expect(feedback.filter({ hasText: message }).first()).toBeVisible();
  }

  async openHistoryNav(): Promise<void> {
    const { role, name } = dashboardLocators.nav.history;
    await this.page.getByRole(role, { name }).click();
    await expect(this.page).toHaveURL(/\/history/);
  }

  async logoutViaUrl(): Promise<void> {
    await this.page.goto(path('logout'));
    await expect(this.page).toHaveURL(/\/login/);
  }

  /** After login: primary nav / shell visible (stronger than URL-only checks). */
  async expectLoggedInShell(): Promise<void> {
    await expect(this.page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
  }
}
