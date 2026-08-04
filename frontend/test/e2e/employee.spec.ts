import { expect, test, type Page } from '@playwright/test'
import { generateValidNationalId, goToOrganization, login } from './helpers'

// Takvim üzerinden seçim, masaüstü (segmentli metin alanı) ve dokunmatik
// (MUI X'in otomatik olarak MobileDatePicker'a geçtiği) sürümlerde AYNI
// şekilde çalışır — bu yüzden gün/ay/yıl segmentlerine yazmak yerine
// takvimden seçim yapılır (her iki varyantta da ortak, güvenilir yol).
async function fillHireDateViaCalendar(page: Page) {
  await page.getByRole('button', { name: 'Choose date' }).click()
  await page.getByRole('gridcell', { name: '15', exact: true }).click()
  // MobileDatePicker (dokunmatik projelerde otomatik seçilir) gün
  // tıklamasında dialogu OTOMATİK KAPATMAZ — DesktopDatePicker'ın aksine
  // ayrı bir "OK" onayı gerektirir; yalnızca dokunmatik projede görünür.
  const okButton = page.getByRole('button', { name: 'OK' })
  if (await okButton.isVisible().catch(() => false)) {
    await okButton.click()
  }
}

test.describe('Çalışan Oluşturma (13.5)', () => {
  test('geçerli bilgilerle çalışan oluşturur, detay sayfasına yönlendirir ve bilgiler orada görünür', async ({
    page,
    isMobile,
  }) => {
    const suffix = Date.now()
    const firstName = 'Ahmet'
    const lastName = `E2E${suffix}`
    const nationalId = generateValidNationalId()
    const email = `ahmet.${suffix}@dijitalik.local`

    await login(page)
    await goToOrganization(page, isMobile)
    await page.getByRole('tab', { name: 'Çalışanlar' }).click()
    await expect(page).toHaveURL(/\/organization\/employees$/)

    await page.getByRole('button', { name: 'Yeni Çalışan' }).click()
    await expect(page).toHaveURL(/\/organization\/employees\/new/)

    await page.getByLabel('Ad', { exact: true }).fill(firstName)
    await page.getByLabel('Soyad').fill(lastName)
    await page.getByLabel('TC Kimlik No').fill(nationalId)
    await fillHireDateViaCalendar(page)
    await page.getByLabel('E-posta').fill(email)

    await page.getByRole('button', { name: 'Oluştur' }).click()

    // Bölüm 13.5 E2E kabul kriteri: detay sayfasına yönlendirilir ve
    // girilen bilgiler ORADA görünür.
    await expect(page).toHaveURL(/\/organization\/employees\/\d+/)
    await expect(page.getByText('Çalışan oluşturuldu')).toBeVisible()
    await expect(page.getByRole('heading', { name: `${firstName} ${lastName}` })).toBeVisible()
    await expect(page.getByText(nationalId)).toBeVisible()
    await expect(page.getByText(email)).toBeVisible()
  })

  test('mükerrer TC Kimlik No ile oluşturma denemesi form üstü banner gösterir', async ({ page, isMobile }) => {
    const nationalId = generateValidNationalId()

    async function fillAndSubmit(lastName: string, email: string) {
      await page.getByLabel('Ad', { exact: true }).fill('Ahmet')
      await page.getByLabel('Soyad').fill(lastName)
      await page.getByLabel('TC Kimlik No').fill(nationalId)
      await fillHireDateViaCalendar(page)
      await page.getByLabel('E-posta').fill(email)
      await page.getByRole('button', { name: 'Oluştur' }).click()
    }

    await login(page)
    await goToOrganization(page, isMobile)
    await page.getByRole('tab', { name: 'Çalışanlar' }).click()
    await page.getByRole('button', { name: 'Yeni Çalışan' }).click()

    const suffix = Date.now()
    await fillAndSubmit(`Birinci${suffix}`, `birinci.${suffix}@dijitalik.local`)
    await expect(page).toHaveURL(/\/organization\/employees\/\d+/)

    await page.goto('/organization/employees/new')
    await fillAndSubmit(`Ikinci${suffix}`, `ikinci.${suffix}@dijitalik.local`)

    await expect(page.getByText('Bu TC Kimlik No ile kayıtlı bir çalışan zaten var.')).toBeVisible()
    await expect(page).toHaveURL(/\/organization\/employees\/new/)
  })
})
