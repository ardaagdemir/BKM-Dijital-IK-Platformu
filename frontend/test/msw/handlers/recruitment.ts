import { HttpResponse, http } from 'msw'
import type {
  Candidate,
  CandidateNote,
  CandidateStage,
  HiringRequest,
  Interview,
  StaffingNorm,
} from '../../../src/modules/recruitment/types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

function notFound(title: string, detail: string) {
  return HttpResponse.json({ type: 'about:blank', title, status: 404, detail }, { status: 404 })
}

function badRequest(detail: string) {
  return HttpResponse.json(
    { type: 'about:blank', title: 'Geçersiz istek', status: 400, detail },
    { status: 400 },
  )
}

// `leave.ts`'teki AYNI fabrika deseni — her testin kendi izole (mutasyona
// AÇIK) senaryosunu kurabilmesi için.
export function createRecruitmentHandlers(
  initialStaffingNorms: StaffingNorm[] = [],
  initialCandidates: Candidate[] = [],
  initialHiringRequests: HiringRequest[] = [],
) {
  const staffingNorms = [...initialStaffingNorms]
  const candidates = [...initialCandidates]
  const hiringRequests = [...initialHiringRequests]
  const notesByCandidateId = new Map<number, CandidateNote[]>()
  const interviewsByCandidateId = new Map<number, Interview[]>()
  let nextStaffingNormId = staffingNorms.reduce((max, n) => Math.max(max, n.id), 0) + 1
  let nextCandidateId = candidates.reduce((max, c) => Math.max(max, c.id), 0) + 1
  let nextHiringRequestId = hiringRequests.reduce((max, r) => Math.max(max, r.id), 0) + 1
  let nextNoteId = 1
  let nextInterviewId = 1

  return [
    http.put(`${BASE_URL}/api/recruitment/staffing-norms`, async ({ request }) => {
      const body = (await request.json()) as { organizationUnitId: number; jobTitleId: number; normCount: number }
      const existing = staffingNorms.find(
        (n) => n.organizationUnitId === body.organizationUnitId && n.jobTitleId === body.jobTitleId,
      )
      if (existing) {
        existing.normCount = body.normCount
        return HttpResponse.json(existing)
      }
      const created: StaffingNorm = { id: nextStaffingNormId++, ...body }
      staffingNorms.push(created)
      return HttpResponse.json(created)
    }),
    http.get(`${BASE_URL}/api/recruitment/staffing-norms`, () => HttpResponse.json(staffingNorms)),

    http.post(`${BASE_URL}/api/recruitment/candidates/applications`, async ({ request }) => {
      const formData = await request.formData()
      const firstName = formData.get('firstName') as string | null
      const lastName = formData.get('lastName') as string | null
      const email = formData.get('email') as string | null
      const appliedPosition = formData.get('appliedPosition') as string | null
      const cv = formData.get('cv') as File | null
      if (!firstName) {
        return badRequest('Ad boş olamaz.')
      }
      if (!lastName) {
        return badRequest('Soyad boş olamaz.')
      }
      if (!email) {
        return badRequest('E-posta boş olamaz.')
      }
      if (!appliedPosition) {
        return badRequest('Başvurulan pozisyon boş olamaz.')
      }
      if (!cv || cv.size === 0) {
        return badRequest('CV dosyası boş olamaz.')
      }
      if (cv.name === 'enfekte.pdf') {
        return HttpResponse.json(
          {
            type: 'about:blank',
            title: 'Dosya reddedildi',
            status: 422,
            detail: 'Dosyada virüs/kötü amaçlı içerik tespit edildi.',
          },
          { status: 422 },
        )
      }
      const created: Candidate = {
        id: nextCandidateId++,
        firstName,
        lastName,
        email,
        appliedPosition,
        cvFileName: cv.name,
        stage: 'APPLICATION',
        converted: false,
      }
      candidates.push(created)
      return HttpResponse.json(created, { status: 201 })
    }),

    http.get(`${BASE_URL}/api/recruitment/candidates`, () =>
      HttpResponse.json([...candidates].sort((a, b) => b.id - a.id)),
    ),

    http.get(`${BASE_URL}/api/recruitment/candidates/:id/cv`, ({ params }) => {
      const id = Number(params.id)
      const candidate = candidates.find((c) => c.id === id)
      if (!candidate) {
        return notFound('Aday bulunamadı', 'Aday bulunamadı.')
      }
      return new HttpResponse('örnek cv içeriği', {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${candidate.cvFileName}"`,
        },
      })
    }),

    http.get(`${BASE_URL}/api/recruitment/candidates/:id`, ({ params }) => {
      const id = Number(params.id)
      const candidate = candidates.find((c) => c.id === id)
      if (!candidate) {
        return notFound('Aday bulunamadı', 'Aday bulunamadı.')
      }
      return HttpResponse.json(candidate)
    }),

    http.put(`${BASE_URL}/api/recruitment/candidates/:id/stage`, async ({ request, params }) => {
      const id = Number(params.id)
      const candidate = candidates.find((c) => c.id === id)
      if (!candidate) {
        return notFound('Aday bulunamadı', 'Aday bulunamadı.')
      }
      const body = (await request.json()) as { stage: CandidateStage }
      candidate.stage = body.stage
      return HttpResponse.json(candidate)
    }),

    http.post(`${BASE_URL}/api/recruitment/candidates/:id/convert-to-employee`, ({ params }) => {
      const id = Number(params.id)
      const candidate = candidates.find((c) => c.id === id)
      if (!candidate) {
        return notFound('Aday bulunamadı', 'Aday bulunamadı.')
      }
      if (candidate.converted) {
        return badRequest('Bu aday zaten bir çalışan kaydına dönüştürülmüş.')
      }
      candidate.converted = true
      candidate.stage = 'HIRED'
      return HttpResponse.json({
        candidateId: candidate.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
      })
    }),

    http.get(`${BASE_URL}/api/recruitment/candidates/:candidateId/notes`, ({ params }) => {
      const candidateId = Number(params.candidateId)
      return HttpResponse.json([...(notesByCandidateId.get(candidateId) ?? [])].sort((a, b) => b.id - a.id))
    }),
    http.post(`${BASE_URL}/api/recruitment/candidates/:candidateId/notes`, async ({ request, params }) => {
      const candidateId = Number(params.candidateId)
      const body = (await request.json()) as { noteText: string }
      if (!body.noteText || !body.noteText.trim()) {
        return badRequest('Not metni boş olamaz.')
      }
      const created: CandidateNote = { id: nextNoteId++, candidateId, noteText: body.noteText }
      const list = notesByCandidateId.get(candidateId) ?? []
      list.push(created)
      notesByCandidateId.set(candidateId, list)
      return HttpResponse.json(created, { status: 201 })
    }),

    http.get(`${BASE_URL}/api/recruitment/candidates/:candidateId/interviews`, ({ params }) => {
      const candidateId = Number(params.candidateId)
      return HttpResponse.json(
        [...(interviewsByCandidateId.get(candidateId) ?? [])].sort((a, b) =>
          a.interviewDate < b.interviewDate ? 1 : -1,
        ),
      )
    }),
    http.post(`${BASE_URL}/api/recruitment/candidates/:candidateId/interviews`, async ({ request, params }) => {
      const candidateId = Number(params.candidateId)
      const body = (await request.json()) as { interviewDate: string; participants: string; result: string }
      const created: Interview = { id: nextInterviewId++, candidateId, ...body }
      const list = interviewsByCandidateId.get(candidateId) ?? []
      list.push(created)
      interviewsByCandidateId.set(candidateId, list)
      return HttpResponse.json(created, { status: 201 })
    }),

    http.post(`${BASE_URL}/api/recruitment/hiring-requests`, async ({ request }) => {
      const body = (await request.json()) as { organizationUnitId: number; jobTitleId: number }
      const hasNorm = staffingNorms.some(
        (n) => n.organizationUnitId === body.organizationUnitId && n.jobTitleId === body.jobTitleId,
      )
      if (!hasNorm) {
        return notFound('Norm kadro bulunamadı', 'Bu birim/unvan için norm kadro tanımlı değil.')
      }
      const created: HiringRequest = {
        id: nextHiringRequestId++,
        organizationUnitId: body.organizationUnitId,
        jobTitleId: body.jobTitleId,
        status: 'PENDING',
      }
      hiringRequests.push(created)
      return HttpResponse.json(created, { status: 201 })
    }),

    http.get(`${BASE_URL}/api/recruitment/hiring-requests`, ({ request }) => {
      const url = new URL(request.url)
      const organizationUnitIdParam = url.searchParams.get('organizationUnitId')
      const content =
        organizationUnitIdParam === null
          ? hiringRequests
          : hiringRequests.filter((r) => r.organizationUnitId === Number(organizationUnitIdParam))
      return HttpResponse.json([...content].sort((a, b) => b.id - a.id))
    }),

    http.put(`${BASE_URL}/api/recruitment/hiring-requests/:id/manager-decision`, async ({ request, params }) => {
      const id = Number(params.id)
      const hiringRequest = hiringRequests.find((r) => r.id === id)
      if (!hiringRequest) {
        return notFound('İşe alım talebi bulunamadı', 'İşe alım talebi bulunamadı.')
      }
      if (hiringRequest.status !== 'PENDING') {
        return badRequest('Bu talep zaten yönetici kararına bağlanmış.')
      }
      const body = (await request.json()) as { decision: 'APPROVED' | 'REJECTED' }
      hiringRequest.status = body.decision === 'APPROVED' ? 'MANAGER_APPROVED' : 'REJECTED'
      return HttpResponse.json(hiringRequest)
    }),

    http.put(`${BASE_URL}/api/recruitment/hiring-requests/:id/hr-decision`, async ({ request, params }) => {
      const id = Number(params.id)
      const hiringRequest = hiringRequests.find((r) => r.id === id)
      if (!hiringRequest) {
        return notFound('İşe alım talebi bulunamadı', 'İşe alım talebi bulunamadı.')
      }
      if (hiringRequest.status === 'PENDING') {
        return badRequest('Bu talep henüz yönetici onayından geçmedi.')
      }
      if (hiringRequest.status !== 'MANAGER_APPROVED') {
        return badRequest('Bu talep zaten İK kararına bağlanmış.')
      }
      const body = (await request.json()) as { decision: 'APPROVED' | 'REJECTED' }
      hiringRequest.status = body.decision
      return HttpResponse.json(hiringRequest)
    }),
  ]
}
