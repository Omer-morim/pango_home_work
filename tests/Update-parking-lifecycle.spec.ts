import { test } from '@playwright/test';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { credentials } from './config/credentials.js';
import { LoginPage } from './pages/login/LoginPage.js';
import { DashboardPage } from './pages/dashboard/DashboardPage.js';
import { HistoryPage } from './pages/history/HistoryPage.js';

/** 1×1 transparent PNG (valid bytes) */
const PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

test.describe('Parking lifecycle (POM)', () => {
  let pngPath: string;
  let txtPath: string;

  test.beforeAll(() => {
    pngPath = path.join(os.tmpdir(), `parkly-tiny-${Date.now()}.png`);
    fs.writeFileSync(pngPath, Buffer.from(PNG_BASE64, 'base64'));
    txtPath = path.join(os.tmpdir(), `parkly-not-image-${Date.now()}.txt`);
    fs.writeFileSync(txtPath, 'not-an-image');
  });

  test('login → start parking → end → history shows plate', async ({ page }) => {
    const login = new LoginPage(page);
    const dash = new DashboardPage(page);
    const history = new HistoryPage(page);

    const plate = `1${Date.now().toString().slice(-7)}`;
    const slot = `Slot_${Date.now()}`;

    await test.step('Login as admin and verify authenticated shell', async () => {
      await login.goto();
      await login.login(credentials.adminUser, credentials.adminPassword);
      await dash.expectLoggedInShell();
    });

    await test.step('Start parking and verify active row state', async () => {
      await dash.goto();
      await dash.startParking({ plate, slot, imagePath: pngPath });
      await dash.expectActiveRowVisible(plate);
    });

    await test.step('End active parking and verify removal from active list', async () => {
      await dash.endParkingForPlate(plate);
      await dash.expectActiveRowGone(plate);
    });

    await test.step('Open history and verify row-level plate + slot match', async () => {
      await dash.openHistoryNav();
      await history.expectHistoryShell();
      await history.expectPlateRecorded(plate);
      await history.expectRecordRowContains(plate, slot);
    });
  });

  test('rejects invalid upload inside parking journey', async ({ page }) => {
    const login = new LoginPage(page);
    const dash = new DashboardPage(page);

    const invalidPlate = 'ABCD1234';
    const slot = `Slot_invalid_${Date.now()}`;

    await test.step('Login as admin and open dashboard', async () => {
      await login.goto();
      await login.login(credentials.adminUser, credentials.adminPassword);
      await dash.expectLoggedInShell();
      await dash.goto();
    });

    await test.step('Try starting parking with invalid plate and non-image file', async () => {
      await dash.startParking({ plate: invalidPlate, slot, imagePath: txtPath });
      await dash.expectValidationMessageVisible();
      await dash.expectActiveRowGone(invalidPlate);
    });
  });
});
