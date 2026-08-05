import { HttpResponse, http } from 'msw'
import type { Award, DisciplinaryCase, DisciplinaryCaseRevision, Warning } from '../../../src/modules/discipline/types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

function notFound(title: string, detail: string) {
  return HttpResponse.json({ type: 'about:blank', title, status: 404, detail }, { status: 404 })
}

function badRequest(detail: string) {
  return HttpResponse.json({ type: 'about:blank', title: 'Geçersiz istek', status: 400, detail }, { status: 400 })
}

export type InitialDisciplinaryCase = { rootId: number; employeeId: number; revisions: DisciplinaryCaseRevision[] }

// `travel.ts`/`training.ts`'teki AYNI fabrika deseni. Revizyon modeli
// (SEC-021) BASİTLEŞTİRİLMİŞ olarak taklit edilir: her süreç için bir
// revizyon DİZİSİ (en yeni SONDA, backend'in TERSİ — okurken ÇEVRİLİR).
export function createDisciplineHandlers(
  initialWarnings: Warning[] = [],
  initialCases: InitialDisciplinaryCase[] = [],
  initialAwards: Award[] = [],
) {
  const warnings = [...initialWarnings]
  const cases = new Map<number, DisciplinaryCaseRevision[]>()
  const employeeIdByRootId = new Map<number, number>()
  const awards = [...initialAwards]
  let nextWarningId = warnings.reduce((max, w) => Math.max(max, w.id), 0) + 1
  let nextCaseId = 1
  for (const { rootId, employeeId, revisions } of initialCases) {
    cases.set(rootId, [...revisions])
    employeeIdByRootId.set(rootId, employeeId)
    nextCaseId = Math.max(nextCaseId, rootId, ...revisions.map((r) => r.id)) + 1
  }
  let nextAwardId = awards.reduce((max, a) => Math.max(max, a.id), 0) + 1

  function latestRevision(rootId: number): DisciplinaryCaseRevision | undefined {
    const revisions = cases.get(rootId)
    return revisions?.[revisions.length - 1]
  }

  return [
    http.post(`${BASE_URL}/api/discipline/warnings`, async ({ request }) => {
      const body = (await request.json()) as { employeeId: number; date: string; reason: string; description: string }
      if (!body.date) {
        return badRequest('Tarih boş olamaz.')
      }
      if (!body.reason) {
        return badRequest('Sebep boş olamaz.')
      }
      if (!body.description) {
        return badRequest('Açıklama boş olamaz.')
      }
      const created: Warning = { id: nextWarningId++, ...body }
      warnings.push(created)
      return HttpResponse.json(created, { status: 201 })
    }),
    http.get(`${BASE_URL}/api/discipline/warnings`, ({ request }) => {
      const url = new URL(request.url)
      const employeeId = Number(url.searchParams.get('employeeId'))
      return HttpResponse.json(
        warnings.filter((w) => w.employeeId === employeeId).sort((a, b) => (a.date < b.date ? 1 : -1)),
      )
    }),

    http.post(`${BASE_URL}/api/discipline/cases`, async ({ request }) => {
      const body = (await request.json()) as { employeeId: number; reason: string }
      if (!body.reason) {
        return badRequest('Gerekçe boş olamaz.')
      }
      const rootId = nextCaseId++
      employeeIdByRootId.set(rootId, body.employeeId)
      const created: DisciplinaryCaseRevision = {
        id: rootId,
        reason: body.reason,
        defense: null,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      }
      cases.set(rootId, [created])
      return HttpResponse.json({ id: rootId, employeeId: body.employeeId, reason: body.reason, defense: null, status: 'OPEN' }, { status: 201 })
    }),
    http.get(`${BASE_URL}/api/discipline/cases`, ({ request }) => {
      const url = new URL(request.url)
      const employeeId = Number(url.searchParams.get('employeeId'))
      const content: DisciplinaryCase[] = []
      for (const [rootId, empId] of employeeIdByRootId.entries()) {
        if (empId !== employeeId) {
          continue
        }
        const latest = latestRevision(rootId)
        if (latest) {
          content.push({ id: rootId, employeeId: empId, reason: latest.reason, defense: latest.defense, status: latest.status })
        }
      }
      return HttpResponse.json(content.sort((a, b) => b.id - a.id))
    }),
    http.put(`${BASE_URL}/api/discipline/cases/:id/defense`, async ({ request, params }) => {
      const id = Number(params.id)
      const latest = latestRevision(id)
      if (!latest) {
        return notFound('Ceza süreci bulunamadı', 'Ceza süreci bulunamadı.')
      }
      const body = (await request.json()) as { defense: string }
      if (!body.defense || !body.defense.trim()) {
        return badRequest('Savunma boş olamaz.')
      }
      if (latest.status !== 'OPEN') {
        return badRequest('Kapatılmış bir sürece savunma eklenemez.')
      }
      const revision: DisciplinaryCaseRevision = {
        id: nextCaseId++,
        reason: latest.reason,
        defense: body.defense,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      }
      cases.get(id)!.push(revision)
      const employeeId = employeeIdByRootId.get(id)!
      return HttpResponse.json({ id, employeeId, reason: revision.reason, defense: revision.defense, status: revision.status })
    }),
    http.put(`${BASE_URL}/api/discipline/cases/:id/close`, ({ params }) => {
      const id = Number(params.id)
      const latest = latestRevision(id)
      if (!latest) {
        return notFound('Ceza süreci bulunamadı', 'Ceza süreci bulunamadı.')
      }
      if (latest.status !== 'OPEN') {
        return badRequest('Bu süreç zaten kapatılmış.')
      }
      if (!latest.defense || !latest.defense.trim()) {
        return badRequest('Savunma alınmadan ceza süreci tamamlanamaz.')
      }
      const revision: DisciplinaryCaseRevision = {
        id: nextCaseId++,
        reason: latest.reason,
        defense: latest.defense,
        status: 'CLOSED',
        createdAt: new Date().toISOString(),
      }
      cases.get(id)!.push(revision)
      const employeeId = employeeIdByRootId.get(id)!
      return HttpResponse.json({ id, employeeId, reason: revision.reason, defense: revision.defense, status: revision.status })
    }),
    http.get(`${BASE_URL}/api/discipline/cases/:id/revisions`, ({ params }) => {
      const id = Number(params.id)
      const revisions = cases.get(id)
      if (!revisions || revisions.length === 0) {
        return notFound('Ceza süreci bulunamadı', 'Ceza süreci bulunamadı.')
      }
      return HttpResponse.json([...revisions].reverse())
    }),

    http.post(`${BASE_URL}/api/discipline/awards`, async ({ request }) => {
      const body = (await request.json()) as { employeeId: number; type: string; description: string }
      if (!body.type) {
        return badRequest('Ödül türü boş olamaz.')
      }
      if (!body.description) {
        return badRequest('Açıklama boş olamaz.')
      }
      const created: Award = { id: nextAwardId++, ...body }
      awards.push(created)
      return HttpResponse.json(created, { status: 201 })
    }),
    http.get(`${BASE_URL}/api/discipline/awards`, ({ request }) => {
      const url = new URL(request.url)
      const employeeId = Number(url.searchParams.get('employeeId'))
      return HttpResponse.json(awards.filter((a) => a.employeeId === employeeId).sort((a, b) => b.id - a.id))
    }),
  ]
}
