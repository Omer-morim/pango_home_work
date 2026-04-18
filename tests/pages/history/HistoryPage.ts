import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { path } from '../../config/endpoints.js';
import { historyLocators } from './history.locators.js';

export class HistoryPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(path('history'));
    await expect(this.page).toHaveURL(/\/history/);
  }

// After navigation: URL + history table body visible. 
  async expectHistoryShell(): Promise<void> {
    await expect(this.page).toHaveURL(/\/history/);
    await expect(this.page.locator(historyLocators.tableBody)).toBeVisible();
  }


 //  Assert plate appears as stable text (exact match avoids partial digit collisions).
  
  async expectPlateRecorded(plate: string): Promise<void> {
    const scope = this.page.locator(historyLocators.main).or(this.page.locator('body'));
    await expect(scope.getByText(plate, { exact: true })).toBeVisible();
  }
}
