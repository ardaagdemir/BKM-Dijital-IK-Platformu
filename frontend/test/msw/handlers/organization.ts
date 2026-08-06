import { HttpResponse, http } from 'msw'
import type {
  Employee,
  EmployeeAsset,
  EmployeeAssignmentHistoryEntry,
  EmployeeProfile,
  JobDescription,
  JobTitle,
  OrganizationChartNode,
  OrganizationUnit,
  PolicyDocument,
} from '../../../src/modules/organization/types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

// Auth handlers'ın aksine (sabit senaryolar), CRUD akışını test edebilmek
// için istekler ARASINDA durum TAŞIYAN sahte bir depo — her testin kendi
// izole örneğini oluşturması için bir FABRİKA fonksiyonu olarak sunulur.
export function createOrganizationHandlers(
  initialJobTitles: JobTitle[] = [],
  initialUnits: OrganizationUnit[] = [],
  initialEmployees: Employee[] = [],
  initialAssets: EmployeeAsset[] = [],
  initialAssignmentHistory: EmployeeAssignmentHistoryEntry[] = [],
  initialPolicyDocuments: PolicyDocument[] = [],
  initialJobDescriptions: JobDescription[] = [],
  initialChart: OrganizationChartNode[] = [],
) {
  const jobTitles = [...initialJobTitles]
  const units = [...initialUnits]
  const employees = [...initialEmployees]
  const assets = [...initialAssets]
  const assignmentHistory = [...initialAssignmentHistory]
  const policyDocuments = [...initialPolicyDocuments]
  const jobDescriptions = [...initialJobDescriptions]
  const profiles = new Map<number, EmployeeProfile>()
  let nextJobTitleId = jobTitles.reduce((max, jt) => Math.max(max, jt.id), 0) + 1
  let nextUnitId = units.reduce((max, unit) => Math.max(max, unit.id), 0) + 1
  let nextAssetId = assets.reduce((max, asset) => Math.max(max, asset.id), 0) + 1
  let nextPolicyDocumentId = policyDocuments.reduce((max, d) => Math.max(max, d.id), 0) + 1
  let nextJobDescriptionId = jobDescriptions.reduce((max, d) => Math.max(max, d.id), 0) + 1

  return [
    http.get(`${BASE_URL}/api/organization/units`, () => HttpResponse.json(units)),
    http.post(`${BASE_URL}/api/organization/units`, async ({ request }) => {
      const body = (await request.json()) as { name: string; parentId: number | null }
      const created: OrganizationUnit = { id: nextUnitId++, name: body.name, parentId: body.parentId }
      units.push(created)
      return HttpResponse.json(created, { status: 201 })
    }),

    http.get(`${BASE_URL}/api/organization/job-titles`, () => HttpResponse.json(jobTitles)),
    http.post(`${BASE_URL}/api/organization/job-titles`, async ({ request }) => {
      const body = (await request.json()) as { name: string }
      const created: JobTitle = { id: nextJobTitleId++, name: body.name }
      jobTitles.push(created)
      return HttpResponse.json(created, { status: 201 })
    }),
    http.put(`${BASE_URL}/api/organization/job-titles/:id`, async ({ request, params }) => {
      const id = Number(params.id)
      const body = (await request.json()) as { name: string }
      const index = jobTitles.findIndex((jobTitle) => jobTitle.id === id)
      if (index === -1) {
        return HttpResponse.json(
          { type: 'about:blank', title: 'Unvan bulunamadı', status: 404, detail: 'Unvan bulunamadı.' },
          { status: 404 },
        )
      }
      jobTitles[index] = { id, name: body.name }
      return HttpResponse.json(jobTitles[index])
    }),
    http.delete(`${BASE_URL}/api/organization/job-titles/:id`, ({ params }) => {
      const id = Number(params.id)
      const index = jobTitles.findIndex((jobTitle) => jobTitle.id === id)
      if (index === -1) {
        return HttpResponse.json(
          { type: 'about:blank', title: 'Unvan bulunamadı', status: 404, detail: 'Unvan bulunamadı.' },
          { status: 404 },
        )
      }
      jobTitles.splice(index, 1)
      return new HttpResponse(null, { status: 204 })
    }),

    // Bölüm 13.6 — backend'in GERÇEK filtreleme/sayfalama davranışını
    // taklit eder (bkz. organization.EmployeeSpecifications): name
    // büyük/küçük harf duyarsız KISMİ eşleşme (ad VEYA soyad).
    http.get(`${BASE_URL}/api/organization/employees`, ({ request }) => {
      const url = new URL(request.url)
      const name = url.searchParams.get('name')?.toLowerCase() ?? ''
      const organizationUnitId = url.searchParams.get('organizationUnitId')
      const jobTitleId = url.searchParams.get('jobTitleId')
      const page = Number(url.searchParams.get('page') ?? '0')
      const size = Number(url.searchParams.get('size') ?? '20')

      let filtered = employees
      if (name) {
        filtered = filtered.filter(
          (employee) =>
            employee.firstName.toLowerCase().includes(name) || employee.lastName.toLowerCase().includes(name),
        )
      }
      if (organizationUnitId) {
        filtered = filtered.filter((employee) => employee.organizationUnitId === Number(organizationUnitId))
      }
      if (jobTitleId) {
        filtered = filtered.filter((employee) => employee.jobTitleId === Number(jobTitleId))
      }

      const start = page * size
      const content = filtered.slice(start, start + size)

      return HttpResponse.json({
        content,
        page: { size, number: page, totalElements: filtered.length, totalPages: Math.ceil(filtered.length / size) },
      })
    }),
    http.get(`${BASE_URL}/api/organization/employees/export`, ({ request }) => {
      const url = new URL(request.url)
      const format = url.searchParams.get('format') ?? 'csv'
      const isXlsx = format === 'xlsx'
      return new HttpResponse('id,ad,soyad\n', {
        status: 200,
        headers: {
          'Content-Type': isXlsx
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'text/csv;charset=UTF-8',
          'Content-Disposition': `attachment; filename="calisanlar.${format}"`,
        },
      })
    }),

    // Bölüm 14.3'ün ön-koşulu — `/employees/export` ile AYNI gerekçeyle
    // `/employees/:id`'DEN ÖNCE tanımlanır. Testin "kendisi" olan çalışanı
    // bilmenin bir yolu olmadığından (mock sunucusu token'dan kimlik
    // ÇÖZEMEZ), basitleştirilmiş bir kural izlenir: testler "ben" olan TEK
    // bir çalışanı seed eder, bu handler DİZİDEKİ İLK çalışanı döner.
    http.get(`${BASE_URL}/api/organization/employees/me`, () => {
      if (employees.length === 0) {
        return HttpResponse.json(
          { type: 'about:blank', title: 'Çalışan bulunamadı', status: 404, detail: 'Çalışan bulunamadı.' },
          { status: 404 },
        )
      }
      return HttpResponse.json(employees[0])
    }),
    // Bölüm 13.7 — `/employees/export`'TAN SONRA tanımlanır: MSW handler'ları
    // sırayla eşleştirilir, `:id` deseni "export"u da eşleştirebileceğinden
    // (aynı segment derinliği) daha SPESİFİK olan export handler'ı ÖNCE
    // gelmelidir.
    http.get(`${BASE_URL}/api/organization/employees/:id`, ({ params }) => {
      const id = Number(params.id)
      const employee = employees.find((candidate) => candidate.id === id)
      if (!employee) {
        return HttpResponse.json(
          { type: 'about:blank', title: 'Çalışan bulunamadı', status: 404, detail: 'Çalışan bulunamadı.' },
          { status: 404 },
        )
      }
      return HttpResponse.json(employee)
    }),
    http.put(`${BASE_URL}/api/organization/employees/:id`, async ({ request, params }) => {
      const id = Number(params.id)
      const index = employees.findIndex((employee) => employee.id === id)
      if (index === -1) {
        return HttpResponse.json(
          { type: 'about:blank', title: 'Çalışan bulunamadı', status: 404, detail: 'Çalışan bulunamadı.' },
          { status: 404 },
        )
      }
      const body = (await request.json()) as Omit<Employee, 'id' | 'organizationUnitId' | 'jobTitleId' | 'iban'>
      const duplicateNationalId = employees.some(
        (employee, employeeIndex) => employeeIndex !== index && employee.nationalId === body.nationalId,
      )
      if (duplicateNationalId) {
        return HttpResponse.json(
          {
            type: 'about:blank',
            title: 'Çalışan zaten kayıtlı',
            status: 409,
            detail: 'Bu TC Kimlik No ile kayıtlı bir çalışan zaten var.',
          },
          { status: 409 },
        )
      }
      employees[index] = { ...employees[index], ...body }
      return HttpResponse.json(employees[index])
    }),
    http.put(`${BASE_URL}/api/organization/employees/:id/assignment`, async ({ request, params }) => {
      const id = Number(params.id)
      const index = employees.findIndex((employee) => employee.id === id)
      if (index === -1) {
        return HttpResponse.json(
          { type: 'about:blank', title: 'Çalışan bulunamadı', status: 404, detail: 'Çalışan bulunamadı.' },
          { status: 404 },
        )
      }
      const body = (await request.json()) as { organizationUnitId: number; jobTitleId: number }
      employees[index] = {
        ...employees[index],
        organizationUnitId: body.organizationUnitId,
        jobTitleId: body.jobTitleId,
      }
      return HttpResponse.json(employees[index])
    }),

    // Bölüm 14.2 — GET, profil hiç kaydedilmemişse 404 döner (backend'in
    // GERÇEK davranışı, bkz. EmployeeProfileService); PUT bir UPSERT'tir.
    http.get(`${BASE_URL}/api/organization/employees/:id/profile`, ({ params }) => {
      const id = Number(params.id)
      const profile = profiles.get(id)
      if (!profile) {
        return HttpResponse.json(
          {
            type: 'about:blank',
            title: 'Özlük bilgisi bulunamadı',
            status: 404,
            detail: 'Özlük bilgisi bulunamadı.',
          },
          { status: 404 },
        )
      }
      return HttpResponse.json(profile)
    }),
    http.put(`${BASE_URL}/api/organization/employees/:id/profile`, async ({ request, params }) => {
      const id = Number(params.id)
      const body = (await request.json()) as Omit<EmployeeProfile, 'employeeId'>
      const saved: EmployeeProfile = { employeeId: id, ...body }
      profiles.set(id, saved)
      return HttpResponse.json(saved)
    }),

    // Bölüm 14.2 — dikkat: path değişkeni `employeeId` (bkz. gerçek
    // EmployeeAssetController).
    http.get(`${BASE_URL}/api/organization/employees/:employeeId/assets`, ({ params }) => {
      const employeeId = Number(params.employeeId)
      const content = assets
        .filter((asset) => asset.employeeId === employeeId)
        .sort((a, b) => (a.deliveredAt < b.deliveredAt ? 1 : -1))
      return HttpResponse.json(content)
    }),
    http.post(`${BASE_URL}/api/organization/employees/:employeeId/assets`, async ({ request, params }) => {
      const employeeId = Number(params.employeeId)
      const body = (await request.json()) as { itemName: string; deliveredAt: string }
      if (!body.itemName || !body.itemName.trim()) {
        return HttpResponse.json(
          { type: 'about:blank', title: 'Geçersiz istek', status: 400, detail: 'Zimmet kalemi adı boş olamaz.' },
          { status: 400 },
        )
      }
      const created: EmployeeAsset = {
        id: nextAssetId++,
        employeeId,
        itemName: body.itemName,
        deliveredAt: body.deliveredAt,
        returnedAt: null,
      }
      assets.push(created)
      return HttpResponse.json(created, { status: 201 })
    }),
    http.put(
      `${BASE_URL}/api/organization/employees/:employeeId/assets/:assetId/return`,
      async ({ request, params }) => {
        const employeeId = Number(params.employeeId)
        const assetId = Number(params.assetId)
        const index = assets.findIndex((asset) => asset.id === assetId && asset.employeeId === employeeId)
        if (index === -1) {
          return HttpResponse.json(
            { type: 'about:blank', title: 'Zimmet kaydı bulunamadı', status: 404, detail: 'Zimmet kaydı bulunamadı.' },
            { status: 404 },
          )
        }
        if (assets[index].returnedAt) {
          return HttpResponse.json(
            {
              type: 'about:blank',
              title: 'Geçersiz istek',
              status: 400,
              detail: 'Bu zimmet kalemi zaten iade edilmiş.',
            },
            { status: 400 },
          )
        }
        const body = (await request.json()) as { returnedAt: string }
        assets[index] = { ...assets[index], returnedAt: body.returnedAt }
        return HttpResponse.json(assets[index])
      },
    ),

    // Bölüm 14.2 — salt-okunur; test verisi zaten startDate DESC (en yeni
    // önce) verilmeli, backend'in GERÇEK sıralamasını taklit eder.
    http.get(`${BASE_URL}/api/organization/employees/:employeeId/assignment-history`, ({ params }) => {
      const employeeId = Number(params.employeeId)
      return HttpResponse.json(assignmentHistory.filter((entry) => entry.employeeId === employeeId))
    }),

    // Bölüm 14.7/8I — `PolicyDocumentService.upload`'daki AYNI kurallar.
    http.get(`${BASE_URL}/api/documents`, () => HttpResponse.json(policyDocuments)),
    http.post(`${BASE_URL}/api/documents`, async ({ request }) => {
      const formData = await request.formData()
      const title = formData.get('title') as string | null
      const previousVersionIdRaw = formData.get('previousVersionId') as string | null
      const file = formData.get('file') as File | null

      if (!file || file.size === 0) {
        return HttpResponse.json(
          { type: 'about:blank', title: 'Geçersiz istek', status: 400, detail: 'Doküman dosyası boş olamaz.' },
          { status: 400 },
        )
      }

      let version = 1
      let resolvedTitle = title
      let previousVersionId: number | null = null
      if (previousVersionIdRaw) {
        previousVersionId = Number(previousVersionIdRaw)
        const previous = policyDocuments.find((d) => d.id === previousVersionId)
        if (!previous) {
          return HttpResponse.json(
            { type: 'about:blank', title: 'Bulunamadı', status: 404, detail: 'Doküman bulunamadı.' },
            { status: 404 },
          )
        }
        if (previous.status !== 'ACTIVE') {
          return HttpResponse.json(
            {
              type: 'about:blank',
              title: 'Geçersiz istek',
              status: 400,
              detail: 'Yalnızca güncel (aktif) bir versiyon üzerinden yeni versiyon yüklenebilir.',
            },
            { status: 400 },
          )
        }
        version = previous.version + 1
        resolvedTitle = previous.title
        previous.status = 'ARCHIVED'
      } else if (!title || !title.trim()) {
        return HttpResponse.json(
          { type: 'about:blank', title: 'Geçersiz istek', status: 400, detail: 'Başlık boş olamaz.' },
          { status: 400 },
        )
      }

      const created: PolicyDocument = {
        id: nextPolicyDocumentId++,
        title: resolvedTitle!,
        version,
        fileName: file.name,
        status: 'ACTIVE',
        previousVersionId,
      }
      policyDocuments.push(created)
      return HttpResponse.json(created, { status: 201 })
    }),
    http.get(`${BASE_URL}/api/documents/:id/document`, ({ params }) => {
      const id = Number(params.id)
      const document = policyDocuments.find((d) => d.id === id)
      if (!document) {
        return HttpResponse.json(
          { type: 'about:blank', title: 'Bulunamadı', status: 404, detail: 'Doküman bulunamadı.' },
          { status: 404 },
        )
      }
      return new HttpResponse('örnek dosya içeriği', {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${document.fileName}"`,
        },
      })
    }),

    http.get(`${BASE_URL}/api/documents/job-descriptions`, ({ request }) => {
      const url = new URL(request.url)
      const jobTitleId = Number(url.searchParams.get('jobTitleId'))
      return HttpResponse.json(
        jobDescriptions.filter((d) => d.jobTitleId === jobTitleId).sort((a, b) => b.id - a.id),
      )
    }),
    http.post(`${BASE_URL}/api/documents/job-descriptions`, async ({ request }) => {
      const body = (await request.json()) as { jobTitleId: number; content: string }
      if (!body.content || !body.content.trim()) {
        return HttpResponse.json(
          { type: 'about:blank', title: 'Geçersiz istek', status: 400, detail: 'Görev tanımı boş olamaz.' },
          { status: 400 },
        )
      }
      const created: JobDescription = { id: nextJobDescriptionId++, jobTitleId: body.jobTitleId, content: body.content }
      jobDescriptions.push(created)
      return HttpResponse.json(created, { status: 201 })
    }),

    http.get(`${BASE_URL}/api/organization/chart`, () => HttpResponse.json(initialChart)),
  ]
}
