import { HttpResponse, http } from 'msw'
import type { CompletedTraining, Training, TrainingEnrollment } from '../../../src/modules/training/types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

function notFound(title: string, detail: string) {
  return HttpResponse.json({ type: 'about:blank', title, status: 404, detail }, { status: 404 })
}

function badRequest(detail: string) {
  return HttpResponse.json({ type: 'about:blank', title: 'Geçersiz istek', status: 400, detail }, { status: 400 })
}

// `attendance.ts`/`performance.ts`'teki AYNI fabrika deseni.
export function createTrainingHandlers(initialTrainings: Training[] = [], initialEnrollments: TrainingEnrollment[] = []) {
  const trainings = [...initialTrainings]
  const enrollments = [...initialEnrollments]
  let nextTrainingId = trainings.reduce((max, t) => Math.max(max, t.id), 0) + 1
  let nextEnrollmentId = enrollments.reduce((max, e) => Math.max(max, e.id), 0) + 1

  function toCompleted(enrollment: TrainingEnrollment): CompletedTraining | null {
    if (enrollment.status !== 'COMPLETED' || !enrollment.completedDate) {
      return null
    }
    const training = trainings.find((t) => t.id === enrollment.trainingId)
    return {
      employeeId: enrollment.employeeId,
      trainingId: enrollment.trainingId,
      trainingName: training?.name ?? '—',
      completedDate: enrollment.completedDate,
    }
  }

  return [
    http.get(`${BASE_URL}/api/training/trainings`, () => HttpResponse.json(trainings)),
    http.post(`${BASE_URL}/api/training/trainings`, async ({ request }) => {
      const body = (await request.json()) as { name: string; type: string; durationHours: number; provider: string }
      if (!body.name) {
        return badRequest('Eğitim adı boş olamaz.')
      }
      if (!body.type) {
        return badRequest('Eğitim türü boş olamaz.')
      }
      if (!body.durationHours || body.durationHours <= 0) {
        return badRequest('Süre (saat) sıfırdan büyük olmalıdır.')
      }
      if (!body.provider) {
        return badRequest('Sağlayıcı boş olamaz.')
      }
      const created: Training = { id: nextTrainingId++, ...body }
      trainings.push(created)
      return HttpResponse.json(created, { status: 201 })
    }),
    http.put(`${BASE_URL}/api/training/trainings/:id`, async ({ request, params }) => {
      const id = Number(params.id)
      const index = trainings.findIndex((t) => t.id === id)
      if (index === -1) {
        return notFound('Eğitim bulunamadı', 'Eğitim bulunamadı.')
      }
      const body = (await request.json()) as { name: string; type: string; durationHours: number; provider: string }
      trainings[index] = { id, ...body }
      return HttpResponse.json(trainings[index])
    }),
    http.delete(`${BASE_URL}/api/training/trainings/:id`, ({ params }) => {
      const id = Number(params.id)
      const index = trainings.findIndex((t) => t.id === id)
      if (index === -1) {
        return notFound('Eğitim bulunamadı', 'Eğitim bulunamadı.')
      }
      trainings.splice(index, 1)
      return new HttpResponse(null, { status: 204 })
    }),

    http.post(`${BASE_URL}/api/training/enrollments`, async ({ request }) => {
      const body = (await request.json()) as { employeeId: number; trainingId: number }
      if (!trainings.some((t) => t.id === body.trainingId)) {
        return notFound('Eğitim bulunamadı', 'Eğitim bulunamadı.')
      }
      const created: TrainingEnrollment = {
        id: nextEnrollmentId++,
        employeeId: body.employeeId,
        trainingId: body.trainingId,
        status: 'PENDING',
        rejectionReason: null,
        completedDate: null,
      }
      enrollments.push(created)
      return HttpResponse.json(created, { status: 201 })
    }),

    http.get(`${BASE_URL}/api/training/enrollments/completed`, ({ request }) => {
      const url = new URL(request.url)
      const employeeIdParam = url.searchParams.get('employeeId')
      const content = enrollments
        .filter((e) => employeeIdParam === null || e.employeeId === Number(employeeIdParam))
        .map(toCompleted)
        .filter((c): c is CompletedTraining => c !== null)
        .sort((a, b) => (a.completedDate < b.completedDate ? 1 : -1))
      return HttpResponse.json(content)
    }),

    http.get(`${BASE_URL}/api/training/enrollments`, ({ request }) => {
      const url = new URL(request.url)
      const employeeId = Number(url.searchParams.get('employeeId'))
      return HttpResponse.json(enrollments.filter((e) => e.employeeId === employeeId).sort((a, b) => b.id - a.id))
    }),

    http.put(`${BASE_URL}/api/training/enrollments/:id/decision`, async ({ request, params }) => {
      const id = Number(params.id)
      const index = enrollments.findIndex((e) => e.id === id)
      if (index === -1) {
        return notFound('Eğitim talebi bulunamadı', 'Eğitim talebi bulunamadı.')
      }
      if (enrollments[index].status !== 'PENDING') {
        return badRequest('Bu talep zaten karara bağlanmış.')
      }
      const body = (await request.json()) as { decision: 'APPROVED' | 'REJECTED'; rejectionReason: string | null }
      if (body.decision === 'REJECTED' && (!body.rejectionReason || !body.rejectionReason.trim())) {
        return badRequest('Ret gerekçesi zorunludur.')
      }
      enrollments[index] = {
        ...enrollments[index],
        status: body.decision,
        rejectionReason: body.decision === 'REJECTED' ? body.rejectionReason : null,
      }
      return HttpResponse.json(enrollments[index])
    }),

    http.put(`${BASE_URL}/api/training/enrollments/:id/complete`, async ({ request, params }) => {
      const id = Number(params.id)
      const index = enrollments.findIndex((e) => e.id === id)
      if (index === -1) {
        return notFound('Eğitim talebi bulunamadı', 'Eğitim talebi bulunamadı.')
      }
      const body = (await request.json()) as { completedDate: string }
      if (!body.completedDate) {
        return badRequest('Tamamlanma tarihi boş olamaz.')
      }
      if (enrollments[index].status !== 'APPROVED') {
        return badRequest('Yalnızca onaylanmış bir talep tamamlandı olarak işaretlenebilir.')
      }
      enrollments[index] = { ...enrollments[index], status: 'COMPLETED', completedDate: body.completedDate }
      return HttpResponse.json(enrollments[index])
    }),
  ]
}
