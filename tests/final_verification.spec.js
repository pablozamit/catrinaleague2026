const { test, expect } = require('@playwright/test');

const pages = [
  { name: 'Home', path: 'index.html' },
  { name: 'Login', path: 'login.html' },
  { name: 'ELO Ranking', path: 'elo/index.html' },
  { name: 'Results', path: 'resultados/index.html' },
  { name: 'History', path: 'historial/index.html' },
  { name: 'Profile', path: 'perfil/index.html' },
  { name: 'Confirm', path: 'confirmar/index.html' },
  { name: 'Rules', path: 'reglas/index.html' },
  { name: 'League', path: 'liga/index.html' },
  { name: 'Admin', path: 'admin/index.html' },
  { name: 'Lab', path: 'lab/index.html' }
];

for (const pageInfo of pages) {
  test(`Verify Navigation Component on ${pageInfo.name}`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE (Small mobile)

    await page.goto(`http://localhost:8080/${pageInfo.path}`);

    // Check for navbar
    const nav = page.locator('.catrina-nav');
    await expect(nav).toBeVisible();

    // Check for title
    const title = page.locator('.nav-title');
    await expect(title).toBeVisible();
    await expect(title).toContainText('LA CATRINA');

    // Check for hamburger menu on mobile
    const hamburger = page.locator('#navHamburger');
    await expect(hamburger).toBeVisible();

    // Test hamburger click
    await hamburger.click();
    const menu = page.locator('#navMobileMenu');
    await expect(menu).toHaveClass(/open/);

    // Check for language selector in menu
    const lang = page.locator('#mobileLangContainer select');
    await expect(lang).toBeVisible();

    await page.screenshot({ path: `screenshots/final_${pageInfo.name.toLowerCase().replace(' ', '_')}.png` });
  });
}
