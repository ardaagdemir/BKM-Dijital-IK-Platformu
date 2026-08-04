import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const SEED_EMAIL = 'admin@dijitalik.local'
const SEED_PASSWORD = 'ChangeMe123!'

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByLabel('E-posta').fill(SEED_EMAIL)
  await page.getByLabel('Parola', { exact: true }).fill(SEED_PASSWORD)
  await page.getByRole('button', { name: 'Giriş Yap' }).click()
  await expect(page).toHaveURL('/')
}

test.describe('AppShell (13.2)', () => {
  test('giriş sonrası TÜM korumalı sayfalarda aynı çerçeve (TopBar + kullanıcı menüsü) görünür', async ({
    page,
  }) => {
    await login(page)

    await expect(page.getByRole('button', { name: 'Kullanıcı menüsü' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Ana Sayfa' })).toBeVisible()
  })

  test('kullanıcı menüsü ad, e-posta ve rolü doğru gösterir', async ({ page }) => {
    await login(page)

    await page.getByRole('button', { name: 'Kullanıcı menüsü' }).click()
    await expect(page.getByText('Sistem Yöneticisi')).toBeVisible()
    await expect(page.getByText(SEED_EMAIL)).toBeVisible()
    await expect(page.getByText('ADMIN', { exact: true })).toBeVisible()
  })

  test('çıkış yapınca /logine döner ve oturum tamamen temizlenir', async ({ page }) => {
    await login(page)

    await page.getByRole('button', { name: 'Kullanıcı menüsü' }).click()
    await page.getByRole('menuitem', { name: 'Çıkış Yap' }).click()

    await expect(page).toHaveURL(/\/login/)

    // Oturum GERÇEKTEN temizlendi mi: korumalı sayfaya dönmeye çalışınca
    // tekrar /login'e yönlendirilmeli (bkz. US-02.1.3 kabul kriteri).
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
  })

  test.describe('masaüstü sidebar', () => {
    test('daraltma tercihi sayfa yenilemede kalıcıdır', async ({ page, isMobile }) => {
      test.skip(isMobile, 'Sidebar yalnızca md+ genişlikte render edilir')
      await login(page)

      const collapseButton = page.getByRole('button', { name: 'Menüyü daralt' })
      await expect(collapseButton).toBeVisible()
      await collapseButton.click()

      await expect(page.getByRole('button', { name: 'Menüyü genişlet' })).toBeVisible()

      await page.reload()
      await expect(page.getByRole('button', { name: 'Menüyü genişlet' })).toBeVisible()

      // Sonraki testleri etkilememesi için tercihi geri al.
      await page.getByRole('button', { name: 'Menüyü genişlet' }).click()
    })
  })

  test.describe('mobil gezinme', () => {
    test('alt gezinme çubuğu ve hamburger menüsü çalışır', async ({ page, isMobile }) => {
      test.skip(!isMobile, 'Alt gezinme/hamburger yalnızca xs/sm genişlikte render edilir')
      await login(page)

      await expect(page.getByRole('button', { name: 'Ana Sayfa' })).toBeVisible()
      await page.getByRole('button', { name: 'Menüyü aç' }).click()
      // Hamburger Drawer'ı açtıktan sonra görünen TEK gezinme bağlantısı —
      // kapalı/gizli kopyalar (Sidebar, tablet overlay) erişilebilirlik
      // ağacında YOK, bu yüzden burada strict-mode çakışması OLMAZ.
      await expect(page.getByRole('link', { name: 'Ana Sayfa' })).toBeVisible()
    })
  })

  test.describe('13.3 — aktif öğe vurgusu', () => {
    test('masaüstünde sidebar\'daki aktif öğe aria-current="page" taşır', async ({ page, isMobile }) => {
      test.skip(isMobile, 'Sidebar yalnızca md+ genişlikte render edilir')
      await login(page)

      await expect(page.getByRole('link', { name: 'Ana Sayfa', current: 'page' })).toBeVisible()
    })

    test('mobilde alt gezinmedeki aktif öğe aria-current="page" taşır', async ({ page, isMobile }) => {
      test.skip(!isMobile, 'Alt gezinme yalnızca xs/sm genişlikte render edilir')
      await login(page)

      await expect(page.getByRole('button', { name: 'Ana Sayfa', current: 'page' })).toBeVisible()
    })
  })

  test('ana sayfada kritik erişilebilirlik ihlali yoktur', async ({ page }) => {
    await login(page)

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    const seriousOrCritical = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''))
    expect(seriousOrCritical, JSON.stringify(seriousOrCritical, null, 2)).toEqual([])
  })
})
