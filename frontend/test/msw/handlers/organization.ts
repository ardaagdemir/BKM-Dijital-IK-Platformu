import { HttpResponse, http } from 'msw'
import type { JobTitle, OrganizationUnit } from '../../../src/modules/organization/types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

// Auth handlers'ın aksine (sabit senaryolar), CRUD akışını test edebilmek
// için istekler ARASINDA durum TAŞIYAN sahte bir depo — her testin kendi
// izole örneğini oluşturması için bir FABRİKA fonksiyonu olarak sunulur.
export function createOrganizationHandlers(
  initialJobTitles: JobTitle[] = [],
  initialUnits: OrganizationUnit[] = [],
) {
  const jobTitles = [...initialJobTitles]
  const units = [...initialUnits]
  let nextJobTitleId = jobTitles.reduce((max, jt) => Math.max(max, jt.id), 0) + 1
  let nextUnitId = units.reduce((max, unit) => Math.max(max, unit.id), 0) + 1

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
  ]
}
