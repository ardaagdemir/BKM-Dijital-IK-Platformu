import { HttpResponse, http } from 'msw'
import type { AttendanceRecord, WorkModel, WorkModelAssignment } from '../../../src/modules/attendance/types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

function notFound(title: string, detail: string) {
  return HttpResponse.json({ type: 'about:blank', title, status: 404, detail }, { status: 404 })
}

function badRequest(detail: string) {
  return HttpResponse.json({ type: 'about:blank', title: 'Geçersiz istek', status: 400, detail }, { status: 400 })
}

// `performance.ts`/`recruitment.ts`'teki AYNI fabrika deseni.
export function createAttendanceHandlers(
  initialWorkModels: WorkModel[] = [],
  initialAssignments: WorkModelAssignment[] = [],
  initialRecords: AttendanceRecord[] = [],
) {
  const workModels = [...initialWorkModels]
  const assignments = [...initialAssignments]
  const records = [...initialRecords]
  let nextWorkModelId = workModels.reduce((max, w) => Math.max(max, w.id), 0) + 1

  function deviationsFor(employeeId: number) {
    const assignment = assignments.find((a) => a.employeeId === employeeId)
    if (!assignment) {
      return null
    }
    const workModel = workModels.find((w) => w.id === assignment.workModelId)
    if (!workModel) {
      return null
    }
    return records
      .filter((r) => r.employeeId === employeeId)
      .map((record) => {
        const checkInTime = record.checkInAt.slice(11, 16)
        const lateMinutes = checkInTime > workModel.plannedStartTime.slice(0, 5) ? 15 : 0
        let earlyDepartureMinutes: number | null = null
        if (record.checkOutAt) {
          const checkOutTime = record.checkOutAt.slice(11, 16)
          earlyDepartureMinutes = checkOutTime < workModel.plannedEndTime.slice(0, 5) ? 10 : 0
        }
        return {
          attendanceRecordId: record.id,
          employeeId: record.employeeId,
          checkInAt: record.checkInAt,
          checkOutAt: record.checkOutAt,
          plannedStartTime: workModel.plannedStartTime,
          plannedEndTime: workModel.plannedEndTime,
          lateMinutes,
          earlyDepartureMinutes,
        }
      })
  }

  return [
    http.get(`${BASE_URL}/api/attendance/work-models`, () => HttpResponse.json(workModels)),
    http.post(`${BASE_URL}/api/attendance/work-models`, async ({ request }) => {
      const body = (await request.json()) as { name: string; plannedStartTime: string; plannedEndTime: string }
      if (!body.name) {
        return badRequest('Çalışma modeli adı boş olamaz.')
      }
      if (!body.plannedStartTime || !body.plannedEndTime) {
        return badRequest('Planlanan başlangıç/bitiş saati boş olamaz.')
      }
      if (body.plannedEndTime <= body.plannedStartTime) {
        return badRequest('Planlanan bitiş saati, başlangıç saatinden sonra olmalıdır.')
      }
      const created: WorkModel = { id: nextWorkModelId++, ...body }
      workModels.push(created)
      return HttpResponse.json(created, { status: 201 })
    }),
    http.put(`${BASE_URL}/api/attendance/work-models/:id`, async ({ request, params }) => {
      const id = Number(params.id)
      const index = workModels.findIndex((w) => w.id === id)
      if (index === -1) {
        return notFound('Çalışma modeli bulunamadı', 'Çalışma modeli bulunamadı.')
      }
      const body = (await request.json()) as { name: string; plannedStartTime: string; plannedEndTime: string }
      workModels[index] = { id, ...body }
      return HttpResponse.json(workModels[index])
    }),
    http.delete(`${BASE_URL}/api/attendance/work-models/:id`, ({ params }) => {
      const id = Number(params.id)
      const index = workModels.findIndex((w) => w.id === id)
      if (index === -1) {
        return notFound('Çalışma modeli bulunamadı', 'Çalışma modeli bulunamadı.')
      }
      workModels.splice(index, 1)
      return new HttpResponse(null, { status: 204 })
    }),

    http.get(`${BASE_URL}/api/attendance/employees/:employeeId/work-model-assignment`, ({ params }) => {
      const employeeId = Number(params.employeeId)
      const assignment = assignments.find((a) => a.employeeId === employeeId)
      if (!assignment) {
        return notFound('Çalışma modeli ataması bulunamadı', 'Bu çalışan için bir çalışma modeli ataması bulunamadı.')
      }
      return HttpResponse.json(assignment)
    }),
    http.put(`${BASE_URL}/api/attendance/employees/:employeeId/work-model-assignment`, async ({ request, params }) => {
      const employeeId = Number(params.employeeId)
      const body = (await request.json()) as { workModelId: number }
      if (!workModels.some((w) => w.id === body.workModelId)) {
        return notFound('Çalışma modeli bulunamadı', 'Çalışma modeli bulunamadı.')
      }
      const index = assignments.findIndex((a) => a.employeeId === employeeId)
      const updated: WorkModelAssignment = { employeeId, workModelId: body.workModelId }
      if (index === -1) {
        assignments.push(updated)
      } else {
        assignments[index] = updated
      }
      return HttpResponse.json(updated)
    }),

    http.get(`${BASE_URL}/api/attendance/attendance-records`, ({ request }) => {
      const url = new URL(request.url)
      const employeeId = Number(url.searchParams.get('employeeId'))
      return HttpResponse.json(
        records.filter((r) => r.employeeId === employeeId).sort((a, b) => (a.checkInAt < b.checkInAt ? 1 : -1)),
      )
    }),

    http.get(`${BASE_URL}/api/attendance/attendance-records/deviations`, ({ request }) => {
      const url = new URL(request.url)
      const employeeId = Number(url.searchParams.get('employeeId'))
      const result = deviationsFor(employeeId)
      if (result === null) {
        return notFound('Çalışma modeli ataması bulunamadı', 'Bu çalışan için bir çalışma modeli ataması bulunamadı.')
      }
      return HttpResponse.json(result)
    }),

    http.get(`${BASE_URL}/api/attendance/timesheet`, ({ request }) => {
      const url = new URL(request.url)
      const employeeId = Number(url.searchParams.get('employeeId'))
      const year = Number(url.searchParams.get('year'))
      const month = Number(url.searchParams.get('month'))
      const leaveDates = new Set(url.searchParams.getAll('leaveDates'))

      const assignment = assignments.find((a) => a.employeeId === employeeId)
      if (!assignment) {
        return notFound('Çalışma modeli ataması bulunamadı', 'Bu çalışan için bir çalışma modeli ataması bulunamadı.')
      }
      const workModel = workModels.find((w) => w.id === assignment.workModelId)!
      const [startH, startM] = workModel.plannedStartTime.split(':').map(Number)
      const [endH, endM] = workModel.plannedEndTime.split(':').map(Number)
      const plannedMinutes = endH * 60 + endM - (startH * 60 + startM)

      const daysInMonth = new Date(year, month, 0).getDate()
      const employeeRecords = records.filter((r) => r.employeeId === employeeId && r.checkOutAt)
      const workedByDate = new Map<string, number>()
      employeeRecords.forEach((record) => {
        const date = record.checkInAt.slice(0, 10)
        const inMs = new Date(record.checkInAt).getTime()
        const outMs = new Date(record.checkOutAt!).getTime()
        workedByDate.set(date, (workedByDate.get(date) ?? 0) + Math.round((outMs - inMs) / 60000))
      })

      const days = []
      for (let day = 1; day <= daysInMonth; day++) {
        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        if (leaveDates.has(date)) {
          days.push({ date, status: 'IZINLI', workedMinutes: null, plannedMinutes })
          continue
        }
        const workedMinutes = workedByDate.get(date) ?? 0
        let status = 'NORMAL'
        if (workedMinutes < plannedMinutes) {
          status = 'EKSIK'
        } else if (workedMinutes > plannedMinutes) {
          status = 'FAZLA_MESAI'
        }
        days.push({ date, status, workedMinutes, plannedMinutes })
      }
      return HttpResponse.json({ employeeId, year, month, days })
    }),
  ]
}
