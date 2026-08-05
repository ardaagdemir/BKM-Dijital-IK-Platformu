import { expect, test, type Locator, type Page } from '@playwright/test'
import { generateValidNationalId, goToOrganization, login } from './helpers'

async function fillHireDateViaCalendar(page: Page) {
  await page.getByRole('button', { name: 'Choose date' }).click()
  await page.getByRole('gridcell', { name: '15', exact: true }).click()
  const okButton = page.getByRole('button', { name: 'OK' })
  if (await okButton.isVisible().catch(() => false)) {
    await okButton.click()
  }
}

// `ResponsiveTable`, masaüstü tablo VE mobil kart DOM'unu AYNI ANDA render
// eder (yalnızca CSS display ile ayrışır, bkz. 13.6/13.7'deki AYNI not) —
// bir metin/buton İKİ KEZ eşleşir: DOM sırası her zaman [tablo, kart]
// olduğundan masaüstünde İLK (tablo), mobilde SON (kart) eşleşme GÖRÜNÜR
// olandır.
function visibleMatch(locator: Locator, isMobile: boolean): Locator {
  return isMobile ? locator.last() : locator.first()
}

test.describe('Çalışan Detay — Genişletilmiş Özlük / Zimmetler / Atama Geçmişi (14.2)', () => {
  test('özlük bilgisi kaydedilir, zimmet eklenip iade alınır, atama geçmişinde görünür', async ({
    page,
    isMobile,
  }) => {
    const suffix = `${Date.now()}${Math.floor(Math.random() * 100000)}`
    const firstName = 'Deniz'
    const lastName = `E2E${suffix}`
    const nationalId = generateValidNationalId()
    const email = `deniz.${suffix}@dijitalik.local`
    const unitName = `E2E Birim 142 ${suffix}`
    const jobTitleName = `E2E Unvan 142 ${suffix}`

    await login(page)
    await goToOrganization(page, isMobile)

    // Atama Geçmişi sekmesinin görünür bir kaydı olması için önce bir
    // birim + unvan oluşturulur (13.7'deki AYNI ön koşul).
    await expect(page).toHaveURL(/\/organization\/units/)
    await page.getByRole('button', { name: 'Yeni Birim' }).click()
    await page.getByLabel('Birim Adı').fill(unitName)
    await page.getByRole('button', { name: 'Oluştur' }).click()
    await expect(page.getByText('Birim oluşturuldu')).toBeVisible()

    await page.getByRole('tab', { name: 'Unvanlar' }).click()
    await page.getByRole('button', { name: 'Yeni Unvan' }).click()
    await page.getByLabel('Unvan Adı').fill(jobTitleName)
    await page.getByRole('button', { name: 'Oluştur' }).click()
    await expect(page.getByText('Unvan oluşturuldu')).toBeVisible()

    await page.getByRole('tab', { name: 'Çalışanlar' }).click()
    await page.getByRole('button', { name: 'Yeni Çalışan' }).click()
    await page.getByLabel('Ad', { exact: true }).fill(firstName)
    await page.getByLabel('Soyad').fill(lastName)
    await page.getByLabel('TC Kimlik No').fill(nationalId)
    await fillHireDateViaCalendar(page)
    await page.getByLabel('E-posta').fill(email)
    await page.getByRole('button', { name: 'Oluştur' }).click()
    await expect(page).toHaveURL(/\/organization\/employees\/\d+/)

    // Genişletilmiş Özlük: bir alan doldurulup kaydedilir. Sonraki
    // etkileşim (sekme tıklama) sayfanın ÜSTÜNDE olduğundan alt-ortadaki
    // toast'ın kapanmasını BEKLEMEYE gerek yok (13.7'deki AYNI notun
    // AKSİNE — orada bir sonraki hedef ALT'taydı).
    await page.getByRole('tab', { name: 'Genişletilmiş Özlük' }).click()
    await page.getByLabel('Doğum Yeri').fill('İzmir')
    // Dar viewport'ta form alanlarının Kaydet butonunun konumunu geçici
    // kaydırabilmesi (bkz. 13.7'de keşfedilen AYNI davranış) nedeniyle
    // force kullanılır.
    await page.getByRole('button', { name: 'Kaydet' }).click({ force: true })
    await expect(page.getByText('Özlük bilgileri güncellendi')).toBeVisible()

    // Atama: bir sonraki adımda gerekli olan birim+unvana ata (13.7'deki
    // AYNI form, "Genel Bilgiler" sekmesinde).
    await page.getByRole('tab', { name: 'Genel Bilgiler' }).click()
    await page.getByLabel('Birim').focus()
    await page.keyboard.type(unitName)
    await page.getByLabel('Unvan').focus()
    await page.keyboard.type(jobTitleName)
    await page.getByRole('button', { name: 'Kaydet' }).last().click({ force: true })
    await expect(page.getByText('Atama güncellendi')).toBeVisible()

    // Zimmetler: yeni bir kalem eklenir, listede görünür, sonra iade alınır.
    await page.getByRole('tab', { name: 'Zimmetler' }).click()
    await expect(page.getByText('Henüz zimmet kaydı yok.')).toBeVisible()

    // Dar viewport'ta sayfa başlığı/sabit üst çubuk butonu geçici olarak
    // kaplayabiliyor (bkz. bu dosyadaki diğer force:true kullanımları) —
    // hedef tekil/doğru olduğundan force ile atlanır.
    await page.getByRole('button', { name: 'Yeni Zimmet' }).click({ force: true })
    const createDialog = page.getByRole('dialog')
    await createDialog.getByLabel('Zimmet Kalemi').fill('Dizüstü Bilgisayar')
    await createDialog.getByRole('button', { name: 'Choose date' }).click({ force: true })
    // Takvim BUGÜNÜN ayına açılır — teslim tarihi olarak ayın 1'i seçilir
    // (İADE tarihi aşağıda varsayılan olarak BUGÜN oluyor; backend "iade
    // tarihi teslim tarihinden önce olamaz" kuralına çarpmamak için teslim
    // tarihinin bugünden ÖNCE/AYNI olması garanti edilir — ayın 1'i her
    // zaman bugünün ≤'idir).
    await page.getByRole('gridcell', { name: '1', exact: true }).click()
    const createOkButton = page.getByRole('button', { name: 'OK' })
    if (await createOkButton.isVisible().catch(() => false)) {
      await createOkButton.click()
    }
    // Dar viewport'ta bu diyalog içindeki butonlar da geçici olarak
    // kaplanabiliyor (bkz. bu dosyadaki AYNI mobil düzen kararsızlığı) —
    // tüm diyalog tıklamalarında force kullanılır.
    await createDialog.getByRole('button', { name: 'Ekle' }).click({ force: true })
    await expect(page.getByText('Zimmet eklendi')).toBeVisible()
    await expect(visibleMatch(page.getByText('Dizüstü Bilgisayar'), isMobile)).toBeVisible()

    await visibleMatch(page.getByRole('button', { name: 'İade Al' }), isMobile).click({ force: true })
    const returnDialog = page.getByRole('dialog')
    await returnDialog.getByText('Dizüstü Bilgisayar').waitFor()
    // Dar viewport'ta diyalog içeriği onay butonunu GERÇEKTEN (piksel
    // düzeyinde) kaplayabiliyor — `force: true` yalnızca Playwright'ın ÖN
    // kontrollerini atlar, TARAYICININ kendi hit-test'ini DEĞİL; bu yüzden
    // klavye ile (fare koordinatından TAMAMEN bağımsız) etkinleştirilir.
    await returnDialog.getByRole('button', { name: 'İade Al' }).focus()
    await page.keyboard.press('Enter')
    await expect(page.getByText('Zimmet iade alındı')).toBeVisible()
    await expect(page.getByRole('button', { name: 'İade Al' })).toHaveCount(0)

    // Atama Geçmişi: atanan birim/unvanı içeren en az bir (açık) kayıt var.
    await page.getByRole('tab', { name: 'Atama Geçmişi' }).click()
    if (isMobile) {
      // AccordionList'in mobil özetinde AccordionSummary bir "button" rolü
      // taşır (MUI'nin ButtonBase temeli) — bu, tabloya scope edilemeyen
      // mobil görünümde TEKİL/güvenilir bir hedef sağlar.
      await expect(page.getByRole('button', { name: /Halen Aktif/ })).toBeVisible()
    } else {
      await expect(page.getByRole('table').getByText('Halen Aktif')).toBeVisible()
    }
  })
})
