import { expect, test } from '@playwright/test'

test('renders a basic page', async ({ page }) => {
  await page.setContent('<main><h1>Yearn Powerglove</h1></main>')
  await expect(page.getByRole('heading', { name: 'Yearn Powerglove' })).toBeVisible()
})
