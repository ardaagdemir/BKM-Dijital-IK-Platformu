import { expect, test } from '@playwright/test'
import { goToOrganization, login } from './helpers'

// Bölüm 13.4 Testler: her test kendi test verisini kendisi hazırlar
// (paylaşılan sabit seed veriye GÜVENİLMEZ, bkz. Bölüm 12.3) — isimler
// benzersiz olsun diye zaman damgasıyla üretilir.
//
// Not: UnitTreeDesktop/UnitTreeAccordion ve ResponsiveTable, masaüstü VE
// mobil sürümlerini AYNI ANDA render eder (yalnızca CSS display ile
// ayrışır, bkz. Sidebar/BottomNav'daki AYNI desen) — bu yüzden sorgular
// `role="tree"`/`role="table"`'a SCOPE edilir (yalnızca masaüstü sürümde bu
// rol var, mobil accordion/kart'ta YOK).
test.describe('Organizasyon (13.4)', () => {
  test('kök birim + alt birim oluşturur, ağaçta doğru girintide görünür', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Ağaç görünümü (SimpleTreeView) yalnızca md+ genişlikte render edilir')

    const suffix = Date.now()
    const rootName = `E2E Kök ${suffix}`
    const childName = `E2E Alt ${suffix}`

    await login(page)
    await goToOrganization(page, isMobile)
    await expect(page).toHaveURL(/\/organization\/units/)

    await page.getByRole('button', { name: 'Yeni Birim' }).click()
    await page.getByLabel('Birim Adı').fill(rootName)
    await page.getByRole('button', { name: 'Oluştur' }).click()

    const tree = page.getByRole('tree')
    const rootItem = tree.getByRole('treeitem', { name: new RegExp(`^${rootName}`) })
    await expect(rootItem).toBeVisible()

    await page.getByRole('button', { name: 'Yeni Birim' }).click()
    await page.getByLabel('Birim Adı').fill(childName)
    await page.getByLabel('Üst Birim').click()
    await page.getByRole('option', { name: new RegExp(rootName) }).click()
    await page.getByRole('button', { name: 'Oluştur' }).click()

    // Ağaç varsayılan olarak DARALTILMIŞ — alt birim görünmeden önce kök
    // düğüm genişletilmeli.
    await rootItem.click()

    // "Doğru girintide" — child treeitem, rootItem'ın KENDİ alt ağacı
    // İÇİNDE (nested <ul role="group">) bulunmalı; bu, gerçek DOM
    // içermesiyle kanıtlanan en güçlü girinti doğrulamasıdır.
    const childItem = rootItem.getByRole('treeitem', { name: new RegExp(`^${childName}`) })
    await expect(childItem).toBeVisible()
  })

  test('unvan oluşturur ve siler', async ({ page, isMobile }) => {
    const suffix = Date.now()
    const jobTitleName = `E2E Unvan ${suffix}`

    await login(page)
    await goToOrganization(page, isMobile)
    await page.getByRole('tab', { name: 'Unvanlar' }).click()
    await expect(page).toHaveURL(/\/organization\/job-titles/)

    await page.getByRole('button', { name: 'Yeni Unvan' }).click()
    await page.getByLabel('Unvan Adı').fill(jobTitleName)
    await page.getByRole('button', { name: 'Oluştur' }).click()

    // Silme butonu, hangi düzende (tablo/kart) render edilirse edilsin
    // GÖRÜNÜR olan TEK kopyayı bulur (bkz. dosya başındaki genel not).
    const deleteButton = page.getByRole('button', { name: `${jobTitleName} unvanını sil` })
    await expect(deleteButton).toBeVisible()

    await deleteButton.click()
    await page.getByRole('button', { name: 'Sil' }).click()

    await expect(page.getByText('Unvan silindi')).toBeVisible()
    await expect(page.getByRole('button', { name: `${jobTitleName} unvanını sil` })).toHaveCount(0)
  })
})
