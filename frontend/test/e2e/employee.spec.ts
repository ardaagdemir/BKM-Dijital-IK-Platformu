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
    // girilen bilgiler ORADA görünür. Bölüm 13.7'den beri ADMIN için bu
    // sayfa düzenlenebilir bir form (bkz. EmployeeDetailPage'in
    // GeneralInfoSection'ı) — değerler <input> DEĞERİ olarak görünür, düz
    // metin DEĞİL; bu yüzden getByText() yerine toHaveValue() kullanılır.
    await expect(page).toHaveURL(/\/organization\/employees\/\d+/)
    await expect(page.getByText('Çalışan oluşturuldu')).toBeVisible()
    await expect(page.getByRole('heading', { name: `${firstName} ${lastName}` })).toBeVisible()
    await expect(page.getByLabel('TC Kimlik No')).toHaveValue(nationalId)
    await expect(page.getByLabel('E-posta')).toHaveValue(email)
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

test.describe('Çalışan Listeleme (13.6)', () => {
  test('oluşturulan çalışan listede görünür, isimle filtrelenir ve CSV indirilir', async ({ page, isMobile }) => {
    // Paralel projeler (chromium/webkit × desktop/mobile) AYNI ANDA
    // başlayabildiğinden salt Date.now() çakışabilir — rastgele bileşen
    // eklenir.
    const suffix = `${Date.now()}${Math.floor(Math.random() * 100000)}`
    const firstName = 'Zeynep'
    const lastName = `E2E${suffix}`
    const nationalId = generateValidNationalId()
    const email = `zeynep.${suffix}@dijitalik.local`

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
    await expect(page).toHaveURL(/\/organization\/employees\/\d+/)

    // 13.5 ile zincirlenmiş senaryo: yeni oluşturulan çalışan listede görünür.
    // Not: varsayılan (filtresiz) görünüm id'ye göre sıralı SAYFA 1 — paylaşılan
    // test veritabanında 20'den fazla çalışan birikince yeni kayıt SONRAKİ
    // sayfaya düşebilir; bu yüzden doğrudan isimle filtrelenerek bulunur
    // (aynı zamanda "isimle filtreleme sonucu daraltır" senaryosunu da kapsar).
    await page.getByRole('tab', { name: 'Çalışanlar' }).click()
    await expect(page).toHaveURL(/\/organization\/employees$/)
    // ResponsiveTable görünüm modu viewport'a göre değişir (masaüstünde
    // tablo, mobilde kart — bkz. ResponsiveTable.tsx), her ikisinde de ad
    // sütunu bir <Link> olarak render edilir — role='link' ile eşleşme hem
    // TableCell/Card gibi metni tekrar eden üst elemanlarla çakışmayı
    // önler hem her iki görünümde de çalışır.
    const nameLink = page.getByRole('link', { name: `${firstName} ${lastName}` })

    await page.getByLabel('İsim ara').fill(lastName)
    await expect(page).toHaveURL(new RegExp(`name=${lastName}`))
    await expect(nameLink).toBeVisible()
    await page.getByLabel('İsim ara').fill('BuIsimHicKimseyeAitDegil')
    await expect(page.getByText('Bu filtrelere uygun çalışan bulunamadı.')).toBeVisible()
    await page.getByLabel('İsim ara').fill('')

    // CSV indirme butonu gerçek bir dosya indirir.
    await page.getByRole('button', { name: 'Dışa Aktar' }).click()
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('menuitem', { name: 'CSV olarak indir' }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('calisanlar.csv')
  })
})

test.describe('Çalışan Detayı (13.7)', () => {
  test('13.5te oluşturulan çalışanın detayında bilgiler doğru görünür, birime/unvana atanabilir ve atama kalıcıdır', async ({
    page,
    isMobile,
  }) => {
    const suffix = `${Date.now()}${Math.floor(Math.random() * 100000)}`
    const firstName = 'Elif'
    const lastName = `E2E${suffix}`
    const nationalId = generateValidNationalId()
    const email = `elif.${suffix}@dijitalik.local`
    const unitName = `E2E Birim ${suffix}`
    const jobTitleName = `E2E Unvan ${suffix}`

    await login(page)
    await goToOrganization(page, isMobile)

    // Atama için gereken birim + unvanı önce oluştur. Görünürlük, ağaç/kart
    // düzeninin viewport'a göre değişmesinden ETKİLENMEYEN başarı toast'ıyla
    // doğrulanır (bkz. 13.4 E2E'nin mobilde ağaç görünümünü SKIP etme nedeni
    // — burada da aynı ayrım geçerli, tam görünüm doğrulaması bu testin
    // kapsamı DEĞİL, yalnızca kaydın oluşması yeterli).
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

    // 13.5 ile zincirlenmiş senaryo: çalışan oluştur → detay sayfasına düşer.
    await page.getByRole('tab', { name: 'Çalışanlar' }).click()
    await page.getByRole('button', { name: 'Yeni Çalışan' }).click()
    await page.getByLabel('Ad', { exact: true }).fill(firstName)
    await page.getByLabel('Soyad').fill(lastName)
    await page.getByLabel('TC Kimlik No').fill(nationalId)
    await fillHireDateViaCalendar(page)
    await page.getByLabel('E-posta').fill(email)
    await page.getByRole('button', { name: 'Oluştur' }).click()
    await expect(page).toHaveURL(/\/organization\/employees\/\d+/)

    // Bölüm 13.7 kabul kriteri: bilgiler detayda DOĞRU görünür (Genel
    // Bilgiler formu ADMIN için düzenlenebilir TextField'lar olarak render
    // edilir, mevcut değerlerle ÖNCEDEN doludur).
    await expect(page.getByLabel('Ad', { exact: true })).toHaveValue(firstName)
    await expect(page.getByLabel('Soyad')).toHaveValue(lastName)
    await expect(page.getByLabel('TC Kimlik No')).toHaveValue(nationalId)
    await expect(page.getByLabel('E-posta')).toHaveValue(email)

    // "Çalışan oluşturuldu" toast'ı sayfanın ALT-ORTASINDA sabit konumda
    // render edilir (bkz. ToastProvider'ın anchorOrigin'i) ve 4sn boyunca
    // görünür kalır — Atama kartının "Kaydet" butonu da sayfanın alt
    // kısmında olduğundan, toast kapanmadan tıklanırsa üstüne biner ve
    // tıklamayı yutar. Devam etmeden ÖNCE kapanmasını bekle.
    await expect(page.getByText('Çalışan oluşturuldu')).toBeHidden()

    // Atama: birime + unvana ata. Paylaşılan test veritabanında biriken
    // kayıtlar dropdown'u uzattığından, popup AÇIP kapatarak seçim (click)
    // kaydırma/kapanış animasyonu yüzünden kararsız — bunun yerine MUI
    // Select'in odaklanınca popup HİÇ açmadan çalışan "type-ahead" klavye
    // davranışı kullanılır (gerçek bir <select>'teki gibi).
    await page.getByLabel('Birim').focus()
    await page.keyboard.type(unitName)
    await expect(page.getByLabel('Birim')).toHaveText(new RegExp(unitName))
    await page.getByLabel('Unvan').focus()
    await page.keyboard.type(jobTitleName)
    await expect(page.getByLabel('Unvan')).toHaveText(jobTitleName)
    // Dar (mobil) viewport'ta, uzun üretilmiş isimlerin Select kutularına
    // yazılması kutu yüksekliğini değiştirip altındaki Kaydet butonunun
    // konumunu geçici olarak kaydırabiliyor — hedef tekil/doğru olduğundan
    // (yukarıdaki toHaveText ile doğrulandı) `force: true` ile bu düzen
    // kararsızlığı atlanır.
    await page.getByRole('button', { name: 'Kaydet' }).last().click({ force: true })

    await expect(page.getByText('Atama güncellendi')).toBeVisible()

    // Atama KALICI mı — sayfa yenilendiğinde de aynı atama görünmeli.
    await page.reload()
    await expect(page.getByLabel('Birim')).toHaveText(new RegExp(unitName))
    await expect(page.getByLabel('Unvan')).toHaveText(jobTitleName)
  })
})
