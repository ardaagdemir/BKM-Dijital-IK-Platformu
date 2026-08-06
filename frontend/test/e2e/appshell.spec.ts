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

  // Menü yeniden düzenlemesi (13.2 revizyonu): masaüstü/tablet menüsü artık
  // açılır-kapanır GRUPLARA ayrılmış (bkz. GroupedNavList.tsx).
  test.describe('menü grupları', () => {
    test('masaüstünde sidebar\'da AKTİF olmayan bir grup başlığına tıklanınca açılır ve içeriği görünür olur', async ({
      page,
      isMobile,
    }) => {
      test.skip(isMobile, 'Genişletilmiş sidebar yalnızca md+ genişlikte render edilir')
      await login(page)

      // '/' rotası "Genel" grubunda — "Yönetim" grubu başlangıçta KAPALI,
      // içindeki "Kullanıcılar" bağlantısı GÖRÜNÜR DEĞİL.
      const yonetimHeader = page.getByRole('button', { name: 'Yönetim' })
      const kullanicilarLink = page.getByRole('link', { name: 'Kullanıcılar' })
      await expect(yonetimHeader).toHaveAttribute('aria-expanded', 'false')
      await expect(kullanicilarLink).toBeHidden()

      await yonetimHeader.click()

      await expect(yonetimHeader).toHaveAttribute('aria-expanded', 'true')
      await expect(kullanicilarLink).toBeVisible()

      await yonetimHeader.click()
      await expect(yonetimHeader).toHaveAttribute('aria-expanded', 'false')
      await expect(kullanicilarLink).toBeHidden()
    })

    test('mobilde "Diğer" tam (gruplu) menüyü açar', async ({ page, isMobile }) => {
      test.skip(!isMobile, '"Diğer" yalnızca xs/sm alt gezinmede görünür')
      await login(page)

      await page.getByRole('button', { name: 'Diğer' }).click()

      // Tam menü Drawer'ı, aktif grup ("Genel") açık, diğerleri (ör.
      // "Yönetim") KAPALI olarak açılır.
      await expect(page.getByRole('link', { name: 'Ana Sayfa' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Yönetim' })).toHaveAttribute('aria-expanded', 'false')
    })
  })

  // Bölüm 4.3 revizyonu: BottomNavigation artık en fazla 5 sabit öğe
  // gösterir (bkz. navigation.getBottomNavItems) — bu testler dar
  // viewport'larda YATAY TAŞMA olmadığını (asıl regresyon riski, MUI'nin
  // `BottomNavigationAction` varsayılan `minWidth: 80`'i 5×80=400px ile
  // 360-390px genişliğindeki cihazları AŞARDI) doğrudan ÖLÇEREK doğrular.
  test.describe('alt gezinme — taşma kontrolü', () => {
    test('alt gezinme çubuğu viewport genişliğini AŞMAZ (yatay taşma yok)', async ({ page, isMobile }) => {
      test.skip(!isMobile, 'Alt gezinme yalnızca xs/sm genişlikte render edilir')
      await login(page)

      const bottomNav = page.locator('.MuiBottomNavigation-root')
      await expect(bottomNav).toBeVisible()

      const overflow = await bottomNav.evaluate((el) => el.scrollWidth - el.clientWidth)
      expect(overflow, 'alt gezinme çubuğunun scrollWidth\'i clientWidth\'ini AŞMAMALI').toBeLessThanOrEqual(1)

      const viewportWidth = page.viewportSize()?.width ?? 0
      const boundingBox = await bottomNav.boundingBox()
      expect(boundingBox?.width ?? 0).toBeLessThanOrEqual(viewportWidth)

      // Sayfanın KENDİSİ de (body) yatay kaydırma GEREKTİRMEMELİ.
      const bodyOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(bodyOverflow).toBeLessThanOrEqual(1)
    })

    test('alt gezinme çubuğunda en fazla 5 öğe (4 kısayol + "Diğer") vardır', async ({ page, isMobile }) => {
      test.skip(!isMobile, 'Alt gezinme yalnızca xs/sm genişlikte render edilir')
      await login(page)

      const actions = page.locator('.MuiBottomNavigation-root .MuiBottomNavigationAction-root')
      await expect(actions).toHaveCount(5)
      await expect(page.getByRole('button', { name: 'Diğer' })).toBeVisible()
    })
  })
})
