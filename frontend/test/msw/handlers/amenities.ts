import { HttpResponse, http } from 'msw'
import type {
  Appointment,
  AppointmentSlot,
  Club,
  ClubEvent,
  ClubMembershipRequest,
  ServiceOffering,
} from '../../../src/modules/amenities/types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

function notFound(title: string, detail: string) {
  return HttpResponse.json({ type: 'about:blank', title, status: 404, detail }, { status: 404 })
}

function badRequest(detail: string) {
  return HttpResponse.json({ type: 'about:blank', title: 'Geçersiz istek', status: 400, detail }, { status: 400 })
}

function forbidden(detail: string) {
  return HttpResponse.json({ type: 'about:blank', title: 'Yetkisiz işlem', status: 403, detail }, { status: 403 })
}

// `training.ts`/`feedback.ts`'teki AYNI fabrika deseni — kulüp tarafı.
export function createClubHandlers(
  initialClubs: Club[] = [],
  initialMembershipRequests: ClubMembershipRequest[] = [],
  initialEvents: ClubEvent[] = [],
) {
  const clubs = [...initialClubs]
  const membershipRequests = [...initialMembershipRequests]
  const events = [...initialEvents]
  let nextClubId = clubs.reduce((max, c) => Math.max(max, c.id), 0) + 1
  let nextRequestId = membershipRequests.reduce((max, r) => Math.max(max, r.id), 0) + 1
  let nextEventId = events.reduce((max, e) => Math.max(max, e.id), 0) + 1

  return [
    http.get(`${BASE_URL}/api/clubs`, () => HttpResponse.json(clubs)),
    http.post(`${BASE_URL}/api/clubs`, async ({ request }) => {
      const body = (await request.json()) as { name: string; leaderId: number | null }
      if (!body.name || !body.name.trim()) {
        return badRequest('Kulüp adı boş olamaz.')
      }
      const created: Club = { id: nextClubId++, name: body.name, leaderId: body.leaderId }
      clubs.push(created)
      return HttpResponse.json(created, { status: 201 })
    }),
    http.put(`${BASE_URL}/api/clubs/:id`, async ({ request, params }) => {
      const id = Number(params.id)
      const index = clubs.findIndex((c) => c.id === id)
      if (index === -1) {
        return notFound('Kulüp bulunamadı', 'Kulüp bulunamadı.')
      }
      const body = (await request.json()) as { name: string; leaderId: number | null }
      if (!body.name || !body.name.trim()) {
        return badRequest('Kulüp adı boş olamaz.')
      }
      clubs[index] = { id, name: body.name, leaderId: body.leaderId }
      return HttpResponse.json(clubs[index])
    }),
    http.delete(`${BASE_URL}/api/clubs/:id`, ({ params }) => {
      const id = Number(params.id)
      const index = clubs.findIndex((c) => c.id === id)
      if (index === -1) {
        return notFound('Kulüp bulunamadı', 'Kulüp bulunamadı.')
      }
      clubs.splice(index, 1)
      return new HttpResponse(null, { status: 204 })
    }),

    http.post(`${BASE_URL}/api/clubs/membership-requests`, async ({ request }) => {
      const body = (await request.json()) as { clubId: number; employeeId: number }
      if (!clubs.some((c) => c.id === body.clubId)) {
        return notFound('Kulüp bulunamadı', 'Kulüp bulunamadı.')
      }
      const created: ClubMembershipRequest = {
        id: nextRequestId++,
        clubId: body.clubId,
        employeeId: body.employeeId,
        status: 'PENDING',
        rejectionReason: null,
      }
      membershipRequests.push(created)
      return HttpResponse.json(created, { status: 201 })
    }),
    http.get(`${BASE_URL}/api/clubs/membership-requests`, ({ request }) => {
      const url = new URL(request.url)
      const employeeIdParam = url.searchParams.get('employeeId')
      const content =
        employeeIdParam === null
          ? membershipRequests
          : membershipRequests.filter((r) => r.employeeId === Number(employeeIdParam))
      return HttpResponse.json([...content].sort((a, b) => b.id - a.id))
    }),
    http.put(`${BASE_URL}/api/clubs/membership-requests/:id/decision`, async ({ request, params }) => {
      const id = Number(params.id)
      const index = membershipRequests.findIndex((r) => r.id === id)
      if (index === -1) {
        return notFound('Üyelik talebi bulunamadı', 'Üyelik talebi bulunamadı.')
      }
      if (membershipRequests[index].status !== 'PENDING') {
        return badRequest('Bu talep zaten karara bağlanmış.')
      }
      const body = (await request.json()) as { status: 'APPROVED' | 'REJECTED'; rejectionReason: string | null }
      if (body.status === 'REJECTED' && (!body.rejectionReason || !body.rejectionReason.trim())) {
        return badRequest('Ret gerekçesi zorunludur.')
      }
      membershipRequests[index] = {
        ...membershipRequests[index],
        status: body.status,
        rejectionReason: body.status === 'REJECTED' ? body.rejectionReason : null,
      }
      return HttpResponse.json(membershipRequests[index])
    }),

    http.get(`${BASE_URL}/api/clubs/events`, ({ request }) => {
      const url = new URL(request.url)
      const clubId = Number(url.searchParams.get('clubId'))
      return HttpResponse.json(events.filter((e) => e.clubId === clubId).sort((a, b) => (a.date < b.date ? -1 : 1)))
    }),
    http.post(`${BASE_URL}/api/clubs/events`, async ({ request }) => {
      const body = (await request.json()) as { clubId: number; employeeId: number; name: string; date: string }
      const club = clubs.find((c) => c.id === body.clubId)
      if (!club) {
        return notFound('Kulüp bulunamadı', 'Kulüp bulunamadı.')
      }
      if (club.leaderId === null || club.leaderId !== body.employeeId) {
        return forbidden('Bu işlemi yalnızca kulüp lideri yapabilir.')
      }
      if (!body.name || !body.name.trim()) {
        return badRequest('Etkinlik adı boş olamaz.')
      }
      const created: ClubEvent = { id: nextEventId++, clubId: body.clubId, name: body.name, date: body.date }
      events.push(created)
      return HttpResponse.json(created, { status: 201 })
    }),
  ]
}

// Randevu tarafı.
export function createAppointmentHandlers(
  initialServices: ServiceOffering[] = [],
  initialSlots: AppointmentSlot[] = [],
  initialAppointments: Appointment[] = [],
) {
  const services = [...initialServices]
  const slots = [...initialSlots]
  const appointments = [...initialAppointments]
  const notes = new Map<number, string | null>()
  let nextServiceId = services.reduce((max, s) => Math.max(max, s.id), 0) + 1
  let nextSlotId = slots.reduce((max, s) => Math.max(max, s.id), 0) + 1
  let nextAppointmentId = appointments.reduce((max, a) => Math.max(max, a.id), 0) + 1

  return [
    http.get(`${BASE_URL}/api/appointments/services`, () => HttpResponse.json(services)),
    http.post(`${BASE_URL}/api/appointments/services`, async ({ request }) => {
      const body = (await request.json()) as { name: string }
      if (!body.name || !body.name.trim()) {
        return badRequest('Hizmet adı boş olamaz.')
      }
      const created: ServiceOffering = { id: nextServiceId++, name: body.name }
      services.push(created)
      return HttpResponse.json(created, { status: 201 })
    }),
    http.put(`${BASE_URL}/api/appointments/services/:id`, async ({ request, params }) => {
      const id = Number(params.id)
      const index = services.findIndex((s) => s.id === id)
      if (index === -1) {
        return notFound('Hizmet bulunamadı', 'Hizmet bulunamadı.')
      }
      const body = (await request.json()) as { name: string }
      services[index] = { id, name: body.name }
      return HttpResponse.json(services[index])
    }),
    http.delete(`${BASE_URL}/api/appointments/services/:id`, ({ params }) => {
      const id = Number(params.id)
      const index = services.findIndex((s) => s.id === id)
      if (index === -1) {
        return notFound('Hizmet bulunamadı', 'Hizmet bulunamadı.')
      }
      services.splice(index, 1)
      return new HttpResponse(null, { status: 204 })
    }),

    http.get(`${BASE_URL}/api/appointments/slots`, ({ request }) => {
      const url = new URL(request.url)
      const serviceOfferingId = Number(url.searchParams.get('serviceOfferingId'))
      return HttpResponse.json(
        slots.filter((s) => s.serviceOfferingId === serviceOfferingId).sort((a, b) => (a.startTime < b.startTime ? -1 : 1)),
      )
    }),
    http.post(`${BASE_URL}/api/appointments/slots`, async ({ request }) => {
      const body = (await request.json()) as { serviceOfferingId: number; startTime: string; endTime: string }
      if (!services.some((s) => s.id === body.serviceOfferingId)) {
        return notFound('Hizmet bulunamadı', 'Hizmet bulunamadı.')
      }
      const overlapping = slots.some(
        (s) =>
          s.serviceOfferingId === body.serviceOfferingId && s.startTime < body.endTime && s.endTime > body.startTime,
      )
      if (overlapping) {
        return badRequest('Bu zaman aralığında çakışan bir slot zaten var.')
      }
      const created: AppointmentSlot = {
        id: nextSlotId++,
        serviceOfferingId: body.serviceOfferingId,
        startTime: body.startTime,
        endTime: body.endTime,
      }
      slots.push(created)
      return HttpResponse.json(created, { status: 201 })
    }),

    http.post(`${BASE_URL}/api/appointments`, async ({ request }) => {
      const body = (await request.json()) as { slotId: number; employeeId: number }
      const slot = slots.find((s) => s.id === body.slotId)
      if (!slot) {
        return notFound('Slot bulunamadı', 'Slot bulunamadı.')
      }
      if (appointments.some((a) => a.slotId === body.slotId)) {
        return badRequest('Bu slot zaten dolu.')
      }
      const overlapping = appointments
        .filter((a) => a.employeeId === body.employeeId)
        .map((a) => slots.find((s) => s.id === a.slotId)!)
        .some((existingSlot) => existingSlot.startTime < slot.endTime && existingSlot.endTime > slot.startTime)
      if (overlapping) {
        return badRequest('Aynı saat diliminde başka bir randevunuz var.')
      }
      const created: Appointment = { id: nextAppointmentId++, slotId: body.slotId, employeeId: body.employeeId }
      appointments.push(created)
      return HttpResponse.json(created, { status: 201 })
    }),
    http.get(`${BASE_URL}/api/appointments`, ({ request }) => {
      const url = new URL(request.url)
      const employeeId = Number(url.searchParams.get('employeeId'))
      return HttpResponse.json(appointments.filter((a) => a.employeeId === employeeId).sort((a, b) => b.id - a.id))
    }),

    http.get(`${BASE_URL}/api/appointments/:id/note`, ({ params }) => {
      const id = Number(params.id)
      if (!appointments.some((a) => a.id === id)) {
        return notFound('Randevu bulunamadı', 'Randevu bulunamadı.')
      }
      return HttpResponse.json({ appointmentId: id, note: notes.get(id) ?? null })
    }),
    http.put(`${BASE_URL}/api/appointments/:id/note`, async ({ request, params }) => {
      const id = Number(params.id)
      if (!appointments.some((a) => a.id === id)) {
        return notFound('Randevu bulunamadı', 'Randevu bulunamadı.')
      }
      const body = (await request.json()) as { note: string }
      notes.set(id, body.note)
      return HttpResponse.json({ appointmentId: id, note: body.note })
    }),
  ]
}
