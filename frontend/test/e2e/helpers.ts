import { expect, type Page } from '@playwright/test'

const SEED_EMAIL = 'admin@dijitalik.local'
const SEED_PASSWORD = 'ChangeMe123!'

export async function login(page: Page) {
  await page.goto('/login')
  await page.getByLabel('E-posta').fill(SEED_EMAIL)
  await page.getByLabel('Parola', { exact: true }).fill(SEED_PASSWORD)
  await page.getByRole('button', { name: 'Giriş Yap' }).click()
  await expect(page).toHaveURL('/')
}

// xs/sm'de "Organizasyon" bağlantısı yalnızca hamburger Drawer'ı açıldıktan
// SONRA erişilebilir (bkz. Bölüm 4.3/13.2) — masaüstünde doğrudan Sidebar'da
// görünür.
export async function goToOrganization(page: Page, isMobile: boolean) {
  if (isMobile) {
    await page.getByRole('button', { name: 'Menüyü aç' }).click()
  }
  await page.getByRole('link', { name: 'Organizasyon' }).click()
}

// Bölüm 13.8 — goToOrganization ile AYNI desen.
export async function goToAudit(page: Page, isMobile: boolean) {
  if (isMobile) {
    await page.getByRole('button', { name: 'Menüyü aç' }).click()
  }
  await page.getByRole('link', { name: 'Audit Kayıtları' }).click()
}

// Backend'in isValidNationalId'siyle (bkz. organization/EmployeeService.java,
// frontend'de schema.ts'teki AYNI algoritma) UYUMLU, rastgele geçerli bir TC
// Kimlik No üretir — her E2E çalıştırmasında 409 (mükerrer) çakışmasından
// kaçınmak için.
export function generateValidNationalId(): string {
  const firstNine = Array.from({ length: 9 }, (_, index) =>
    index === 0 ? Math.floor(Math.random() * 9) + 1 : Math.floor(Math.random() * 10),
  )
  const oddSum = firstNine[0] + firstNine[2] + firstNine[4] + firstNine[6] + firstNine[8]
  const evenSum = firstNine[1] + firstNine[3] + firstNine[5] + firstNine[7]
  const tenth = (((oddSum * 7 - evenSum) % 10) + 10) % 10
  const eleventh = (firstNine.reduce((sum, digit) => sum + digit, 0) + tenth) % 10
  return [...firstNine, tenth, eleventh].join('')
}
