import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { credentials } from './config/credentials.js';
import { LoginPage } from './pages/login/LoginPage.js';
import { DashboardPage } from './pages/dashboard/DashboardPage.js';
import { HistoryPage } from './pages/history/HistoryPage.js';

// 1×1 transparent PNG (valid bytes) 
const PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

test.describe('Parking lifecycle (POM)', () => {
  let pngPath: string;

  test.beforeAll(() => {
    pngPath = path.join(os.tmpdir(), `parkly-tiny-${Date.now()}.png`);
    fs.writeFileSync(pngPath, Buffer.from(PNG_BASE64, 'base64'));
  });

  test('login → start parking → end → history shows plate', async ({ page }) => {
    const login = new LoginPage(page);
    const dash = new DashboardPage(page);
    const history = new HistoryPage(page);

    const plate = `1${Date.now().toString().slice(-7)}`;
    const slot = `Slot_${Date.now()}`;

    // 1) Login — assert login screen, then post-auth shell
    await login.goto();
    await login.login(credentials.adminUser, credentials.adminPassword);
    await dash.expectLoggedInShell();

    // 2) Dashboard — start session; assert active row + End control
    await dash.goto();
    await dash.startParking({ plate, slot, imagePath: pngPath });
    await dash.expectActiveRowVisible(plate);

    // 3) End session — assert row removed from active list
    await dash.endParkingForPlate(plate);
    await dash.expectActiveRowGone(plate);

    // 4) History — assert route + table, then exact plate text
    await dash.openHistoryNav();
    await history.expectHistoryShell();
    await history.expectPlateRecorded(plate);
  });
});
