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

// Menü yeniden düzenlemesi (13.2 revizyonu): menü artık açılır-kapanır
// GRUPLARA ayrılmış (bkz. GroupedNavList.tsx) — yalnızca AKTİF route'un
// grubu varsayılan olarak açıktır. Hedef bağlantı BAŞKA (kapalı) bir
// grubun içindeyse, önce o grubun başlığına (aynı `<ul>`'u `aria-controls`
// ile işaret eden düğme) tıklanır. Grup adı BURADA AYRICA TANIMLANMAZ —
// bağlantının en yakın `id`'li `<ul>` atası ile eşleştirilir (navigation.tsx
// TEK kaynak olarak KALIR, bu test dosyası kendi kopyasını TUTMAZ).
async function ensureNavLinkVisible(page: Page, label: string) {
  const link = page.getByRole('link', { name: label, exact: true })
  if (await link.isVisible()) {
    return link
  }
  const panelId = await link.locator('xpath=ancestor::ul[@id][1]').getAttribute('id')
  await page.locator(`[aria-controls="${panelId}"]`).click()
  await link.waitFor({ state: 'visible' })
  return link
}

// xs/sm'de menü öğeleri yalnızca hamburger Drawer'ı açıldıktan SONRA
// erişilebilir (bkz. Bölüm 4.3/13.2) — masaüstünde doğrudan Sidebar'da,
// gerekirse kendi grubu açılarak.
export async function clickNavLink(page: Page, label: string, isMobile: boolean) {
  if (isMobile) {
    await page.getByRole('button', { name: 'Menüyü aç' }).click()
  }
  const link = await ensureNavLinkVisible(page, label)
  await link.click()
}

export async function goToOrganization(page: Page, isMobile: boolean) {
  await clickNavLink(page, 'Organizasyon', isMobile)
}

// Bölüm 13.8 — goToOrganization ile AYNI desen.
export async function goToAudit(page: Page, isMobile: boolean) {
  await clickNavLink(page, 'Audit Kayıtları', isMobile)
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
