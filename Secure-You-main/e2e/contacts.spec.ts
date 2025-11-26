import { test, expect } from '@playwright/test';

test('add and edit contact flow', async ({ page }) => {
  // Assumes dev server running at baseURL
  await page.goto('/contacts');

  // Click Add New
  await page.click('text="Add New"');

  // Fill form
  await page.fill('input[placeholder="Full Name"], input:below(label:text("Full Name"))', 'E2E Contact');
  await page.fill('input:below(label:text("Relation"))', 'Tester');
  await page.fill('input:below(label:text("Phone"))', '+1234567890');

  // Save
  await page.click('text=Save');

  // Back on contacts page, ensure new contact visible
  await expect(page.locator('text=E2E Contact')).toBeVisible();

  // Open More menu for the new contact (find the card)
  const card = page.locator('text=E2E Contact').first();
  const menuButton = card.locator('button[role="button"] >> nth=0');
  await menuButton.click();

  // Click Edit
  await page.click('text=Edit');
  await expect(page).toHaveURL(/\/contacts\/edit\//);

  // Change name
  await page.fill('input:below(label:text("Full Name"))', 'E2E Contact Edited');
  await page.click('text=Save');
  await expect(page.locator('text=E2E Contact Edited')).toBeVisible();

  // Delete the edited contact via More -> Delete
  const editedCard = page.locator('text=E2E Contact Edited').first();
  await editedCard.locator('button[role="button"]').click();
  await page.click('text=Delete');
  // Confirm in alert dialog
  await page.click('text=Delete');
  await expect(page.locator('text=E2E Contact Edited')).not.toBeVisible();
});
