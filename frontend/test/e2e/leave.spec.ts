import { expect, test } from '@playwright/test'
import { login } from './helpers'

// Bölüm 14.3 Testler: "E2E: talep oluşturma, bakiye yetersizse uyarı
// banner'ı" — tam kapsam. "E2E: onayla → bakiyenin düştüğü, reddet →
// gerekçe zorunluluğu" ise KAPSAM DIŞI: /leave/approvals roadmap'in
// literal rol tablosuna göre yalnızca YONETICI'ye açık ve tek seed
// hesabımız (admin@dijitalik.local) ADMIN rolünde — bu nedenle onay/ret
// akışı, 13.7'deki CALISAN self-view kısıtıyla AYNI mitigasyonla
// (LeaveApprovalsPage.test.tsx'teki MSW-mocklu entegrasyon testleri)
// kapsanır.
test.describe('İzin Yönetimi (14.3)', () => {
  test('izin türü oluşturur ve siler', async ({ page, isMobile }) => {
    const suffix = Date.now()
    const typeName = `E2E İzin Türü ${suffix}`
    const typeCode = `E2E${suffix}`

    await login(page)
    if (isMobile) {
      await page.getByRole('button', { name: 'Menüyü aç' }).click()
    }
    await page.getByRole('link', { name: 'İzin Türleri' }).click()
    await expect(page).toHaveURL(/\/leave\/types/)

    await page.getByRole('button', { name: 'Yeni İzin Türü' }).click()
    await page.getByLabel('İzin Türü Adı').fill(typeName)
    await page.getByLabel('Kod').fill(typeCode)
    await page.getByRole('button', { name: 'Oluştur' }).click()

    const deleteButton = page.getByRole('button', { name: `${typeName} izin türünü sil` })
    await expect(deleteButton).toBeVisible()

    await deleteButton.click()
    await page.getByRole('button', { name: 'Sil' }).click()

    await expect(page.getByText('İzin türü silindi')).toBeVisible()
    await expect(page.getByRole('button', { name: `${typeName} izin türünü sil` })).toHaveCount(0)
  })

  // Not: seed admin hesabının çalışan kaydı (organization.employees.me
  // ile çözülen) 1 yıldan kısa kıdemli olduğundan (bkz. implementasyon
  // logu) entitlementDays=0 — yani HERHANGİ bir talep, gerçek backend
  // hesaplamasıyla otomatik olarak "bakiye yetersiz" uyarısı üretir; bu
  // da roadmap'in istediği senaryoyu ayrıca sıfır bakiyeli bir çalışan
  // kurgulamaya gerek kalmadan doğal olarak test eder.
  test('talep oluşturur, bakiye yetersizse uyarı gösterir ve sayfada kalır', async ({ page, isMobile }) => {
    const suffix = Date.now()
    const typeName = `E2E Talep Türü ${suffix}`
    const typeCode = `E2EREQ${suffix}`

    await login(page)
    if (isMobile) {
      await page.getByRole('button', { name: 'Menüyü aç' }).click()
    }
    await page.getByRole('link', { name: 'İzin Türleri' }).click()
    await page.getByRole('button', { name: 'Yeni İzin Türü' }).click()
    await page.getByLabel('İzin Türü Adı').fill(typeName)
    await page.getByLabel('Kod').fill(typeCode)
    await page.getByRole('button', { name: 'Oluştur' }).click()
    await expect(page.getByText('İzin türü oluşturuldu')).toBeVisible()

    if (isMobile) {
      await page.getByRole('button', { name: 'Menüyü aç' }).click()
    }
    await page.getByRole('link', { name: 'İzin Taleplerim' }).click()
    await expect(page).toHaveURL(/\/leave\/requests/)

    await page.getByRole('button', { name: 'Yeni Talep' }).click()
    await expect(page).toHaveURL(/\/leave\/requests\/new/)

    await page.getByLabel('İzin Türü').click()
    await page.getByRole('option', { name: typeName }).click()

    const startGroup = page.getByRole('group', { name: 'Başlangıç' })
    await startGroup.getByRole('spinbutton', { name: 'Day' }).click()
    await page.keyboard.type('01')
    await startGroup.getByRole('spinbutton', { name: 'Month' }).click()
    await page.keyboard.type('09')
    await startGroup.getByRole('spinbutton', { name: 'Year' }).click()
    await page.keyboard.type('2026')

    const endGroup = page.getByRole('group', { name: 'Bitiş' })
    await endGroup.getByRole('spinbutton', { name: 'Day' }).click()
    await page.keyboard.type('03')
    await endGroup.getByRole('spinbutton', { name: 'Month' }).click()
    await page.keyboard.type('09')
    await endGroup.getByRole('spinbutton', { name: 'Year' }).click()
    await page.keyboard.type('2026')

    await page.getByRole('button', { name: 'Talep Oluştur' }).click()

    await expect(page.getByText(/Bakiye yetersiz/)).toBeVisible()
    // Uyarı ENGELLEMEZ — talep PENDING olarak oluşturuldu ve sayfa
    // DEĞİŞMEDİ (yönlendirme yok), kullanıcı uyarıyı okuyabilir.
    await expect(page).toHaveURL(/\/leave\/requests\/new/)
    await expect(page.getByRole('button', { name: 'Talep Oluştur' })).toBeVisible()
  })
})
