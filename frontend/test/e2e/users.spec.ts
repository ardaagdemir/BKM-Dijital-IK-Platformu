import { expect, test } from '@playwright/test'
import { login } from './helpers'

test.describe('Profil (14.1)', () => {
  test('giriş yapan kullanıcının bilgilerini gösterir', async ({ page }) => {
    await login(page)
    await page.getByRole('button', { name: 'Kullanıcı menüsü' }).click()
    await page.getByRole('menuitem', { name: 'Profilim' }).click()

    await expect(page).toHaveURL(/\/profile$/)
    // UserMenu popover'ı da AYNI e-postayı gösterir — asıl sayfa
    // içeriğine `main` landmark'ıyla scope edilir.
    const main = page.getByRole('main')
    await expect(main.getByText('admin@dijitalik.local')).toBeVisible()
    await expect(main.getByText('ADMIN', { exact: true })).toBeVisible()
  })
})

test.describe('Kullanıcı-Rol Yönetimi (14.1)', () => {
  test('kullanıcı listesinden bir kullanıcının detayına gidilir, mevcut rolleri görünür', async ({
    page,
    isMobile,
  }) => {
    await login(page)

    if (isMobile) {
      await page.getByRole('button', { name: 'Menüyü aç' }).click()
    }
    await page.getByRole('link', { name: 'Kullanıcılar' }).click()
    await expect(page).toHaveURL(/\/admin\/users$/)

    await page.getByRole('link', { name: 'Sistem Yöneticisi' }).click()
    await expect(page).toHaveURL(/\/admin\/users\/\d+\/roles/)

    // Route geçişi sırasında liste sayfasının tablosu KISA bir süre detay
    // sayfasıyla ÇAKIŞABILIYOR (Playwright'ın strict-mode ihlali,
    // getByText'in ANLIK bir çakışmayı bile TOLERE ETMEMESİ — retry ile
    // beklenmiyor); önce TEKİL olan başlığın (h1) görünmesi beklenerek eski
    // içeriğin tamamen kaybolduğundan emin olunur.
    await expect(page.getByRole('heading', { name: 'Sistem Yöneticisi', level: 1 })).toBeVisible()
    const main = page.getByRole('main')
    await expect(main.getByText('admin@dijitalik.local')).toBeVisible()
    await expect(main.getByText('ADMIN', { exact: true })).toBeVisible()
  })

  test('bir rol eklenebilir ve kaldırılabilir', async ({ page }, testInfo) => {
    // Sistemde tek kullanıcı var (seed admin, bkz. 04-implementation-log.md
    // — kullanıcı OLUŞTURMA API'si YOK) — bu yüzden TÜM Playwright
    // projeleri (chromium/webkit × desktop/mobile) AYNI admin kaydı
    // üzerinde çalışırdı; paralel çalıştırıldığında rol ekleme/kaldırma
    // birbirine karışır (ör. bir proje IK'yı eklerken diğeri "IK zaten
    // atanmış" durumunu görüp Rol Ekle listesinde bulamaz). Bu yüzden
    // mutasyon içeren bu senaryo YALNIZCA TEK bir projede çalıştırılır;
    // salt-okunur "rolleri görüntüleme" senaryosu (yukarıda) hâlâ TÜM
    // projelerde çalışır.
    test.skip(testInfo.project.name !== 'chromium-desktop', 'Paylaşılan tek admin kaydı — çakışmayı önlemek için tek projede çalışır.')

    await login(page)
    await page.goto('/admin/users')
    await page.getByRole('link', { name: 'Sistem Yöneticisi' }).click()
    await expect(page).toHaveURL(/\/admin\/users\/\d+\/roles/)

    // ADMIN rolünün KENDİSİ ASLA kaldırılmaz (paylaşılan test veritabanında
    // diğer TÜM testlerin erişimini kilitlerdi) — zararsız bir rol (IK)
    // eklenip AYNI testte temizlenerek uçtan uca akış doğrulanır.
    await page.getByLabel('Rol Ekle').click()
    await page.getByRole('option', { name: 'IK', exact: true }).click()
    await page.getByRole('button', { name: 'Ekle' }).click()

    await expect(page.getByText('Rol eklendi')).toBeVisible()
    const main = page.getByRole('main')
    await expect(main.getByText('IK', { exact: true })).toBeVisible()

    await expect(page.getByText('Rol eklendi')).toBeHidden()
    await page.getByRole('button', { name: 'IK rolünü kaldır' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Kaldır' }).click()

    await expect(page.getByText('Rol kaldırıldı')).toBeVisible()
    await expect(main.getByText('IK', { exact: true })).toBeHidden()
    await expect(main.getByText('ADMIN', { exact: true })).toBeVisible()
  })
})
