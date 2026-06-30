import { test, expect } from '@playwright/test';

test('landing page loads and shows hero', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Environment Variables');
  await expect(page.locator('text=Start Auditing')).toBeVisible();
});

test('dashboard loads', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.locator('h1')).toContainText('Dashboard');
});

test('projects page loads', async ({ page }) => {
  await page.goto('/projects');
  await expect(page.locator('h1')).toContainText('Projects');
});

test('new project wizard works', async ({ page }) => {
  await page.goto('/projects/new');
  await expect(page.locator('text=Project Setup')).toBeVisible();

  // Fill project name
  await page.fill('input#name', 'Test E2E Project');
  await page.click('text=Next');

  // Should be on files step
  await expect(page.locator('text=Upload Files')).toBeVisible();
});

test('settings page loads', async ({ page }) => {
  await page.goto('/settings');
  await expect(page.locator('h1')).toContainText('Settings');
});

test('history page loads', async ({ page }) => {
  await page.goto('/history');
  await expect(page.locator('h1')).toContainText('Scan History');
});

test('theme toggle works', async ({ page }) => {
  await page.goto('/');
  const toggle = page.locator('button[aria-label="Toggle theme"]');
  await expect(toggle).toBeVisible();
  await toggle.click();
});
