import { expect, test, type Page } from '@playwright/test'
import { generateValidNationalId, goToAudit, goToOrganization, login } from './helpers'

async function fillHireDateViaCalendar(page: Page) {
  await page.getByRole('button', { name: 'Choose date' }).click()
  await page.getByRole('gridcell', { name: '15', exact: true }).click()
  const okButton = page.getByRole('button', { name: 'OK' })
  if (await okButton.isVisible().catch(() => false)) {
    await okButton.click()
  }
}

test.describe('Audit Kayıtları (13.8)', () => {
  test('çalışan oluşturunca audit listesinde YENİ bir "Employee/Oluşturma" satırı görünür', async ({
    page,
    isMobile,
  }) => {
    const suffix = `${Date.now()}${Math.floor(Math.random() * 100000)}`
    const firstName = 'Cem'
    const lastName = `E2E${suffix}`
    const nationalId = generateValidNationalId()
    const email = `cem.${suffix}@dijitalik.local`

    await login(page)
    await goToOrganization(page, isMobile)
    await page.getByRole('tab', { name: 'Çalışanlar' }).click()
    await page.getByRole('button', { name: 'Yeni Çalışan' }).click()

    await page.getByLabel('Ad', { exact: true }).fill(firstName)
    await page.getByLabel('Soyad').fill(lastName)
    await page.getByLabel('TC Kimlik No').fill(nationalId)
    await fillHireDateViaCalendar(page)
    await page.getByLabel('E-posta').fill(email)
    await page.getByRole('button', { name: 'Oluştur' }).click()

    await expect(page).toHaveURL(/\/organization\/employees\/(\d+)/)
    const employeeId = new URL(page.url()).pathname.split('/').pop()

    // "Çalışan oluşturuldu" toast'ı sayfanın alt-ortasında sabit — bir
    // sonraki adıma geçmeden ÖNCE kapanmasını bekle (bkz. 13.7'de keşfedilen
    // AYNI davranış: kapanmadan tıklanan bir buton üstüne binip yutabiliyor).
    await expect(page.getByText('Çalışan oluşturuldu')).toBeHidden()

    await goToAudit(page, isMobile)
    await expect(page).toHaveURL(/\/audit$/)

    await page.getByLabel('Varlık Türü').click()
    await page.getByRole('option', { name: 'Employee', exact: true }).click()

    // AccordionList masaüstünde tablo, mobilde accordion render eder (bkz.
    // AccordionList.tsx) — iki görünümün DOM yapısı (ayrı hücreler vs. tek
    // birleşik başlık metni) FARKLI olduğundan viewport'a göre AYRI eşleşir.
    if (isMobile) {
      const summary = page.getByText(new RegExp(`Employee #${employeeId} · Oluşturma`))
      await expect(summary).toBeVisible()
    } else {
      const table = page.getByRole('table')
      const row = table.getByRole('row', { name: new RegExp(`Employee\\s+${employeeId}\\s+Oluşturma`) })
      await expect(row).toBeVisible()
    }
  })
})
