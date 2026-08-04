import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

// V3__seed_admin_user.sql (bkz. 04-implementation-log.md) — yalnızca yerel/
// geliştirme ortamında var olan bootstrap hesabı. Gerçek bir kullanıcı
// oluşturma akışı roadmap'te yok, bu yüzden E2E bu tek hesabı kullanır.
const SEED_EMAIL = 'admin@dijitalik.local'
const SEED_PASSWORD = 'ChangeMe123!'

test.describe('Login (13.1)', () => {
  // Yanlış parola denemesi, hesabı 5 başarısız denemede kilitleyen
  // LoginAttemptService sayacını artırır — bu test grubun BAŞINDA, ardından
  // gelen "doğru bilgiyle giriş" testi başarılı girişle sayacı sıfırlar
  // (bkz. AuthService.login), bu yüzden suit her çalıştığında kendi kendini
  // temizler ve hesap asla 1 başarısız denemenin ötesine geçmez.
  test('yanlış bilgiyle giriş hata mesajı gösterir', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-posta').fill(SEED_EMAIL)
    await page.getByLabel('Parola', { exact: true }).fill('yanlis-parola')
    await page.getByRole('button', { name: 'Giriş Yap' }).click()

    await expect(page.getByText('E-posta veya parola hatalı.')).toBeVisible()
    await expect(page).toHaveURL(/\/login/)
  })

  test('doğru bilgiyle giriş yapınca ana sayfaya yönlendirir', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-posta').fill(SEED_EMAIL)
    await page.getByLabel('Parola', { exact: true }).fill(SEED_PASSWORD)
    await page.getByRole('button', { name: 'Giriş Yap' }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: 'Ana Sayfa' })).toBeVisible()
  })

  test('oturumsuz kullanıcı korumalı ana sayfadan /logine yönlendirilir', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
  })

  test('giriş ekranında kritik erişilebilirlik ihlali yoktur', async ({ page }) => {
    await page.goto('/login')
    const results = await new AxeBuilder({ page })
      .include('body')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    const seriousOrCritical = results.violations.filter((v) =>
      ['serious', 'critical'].includes(v.impact ?? ''),
    )
    expect(seriousOrCritical, JSON.stringify(seriousOrCritical, null, 2)).toEqual([])
  })
})
