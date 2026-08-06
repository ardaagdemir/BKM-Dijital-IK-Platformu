import { apiClient } from '../../../shared/api/apiClient'
import type {
  Appointment,
  AppointmentNote,
  AppointmentSlot,
  CreateAppointmentSlotRequest,
  ServiceOffering,
} from '../types'

export function listServiceOfferings(): Promise<ServiceOffering[]> {
  return apiClient.get<ServiceOffering[]>('/api/appointments/services')
}

export function createServiceOffering(name: string): Promise<ServiceOffering> {
  return apiClient.post<ServiceOffering>('/api/appointments/services', { name })
}

export function updateServiceOffering(id: number, name: string): Promise<ServiceOffering> {
  return apiClient.put<ServiceOffering>(`/api/appointments/services/${id}`, { name })
}

export function deleteServiceOffering(id: number): Promise<void> {
  return apiClient.delete<void>(`/api/appointments/services/${id}`)
}

export function listAppointmentSlots(serviceOfferingId: number): Promise<AppointmentSlot[]> {
  return apiClient.get<AppointmentSlot[]>(`/api/appointments/slots?serviceOfferingId=${serviceOfferingId}`)
}

export function createAppointmentSlot(request: CreateAppointmentSlotRequest): Promise<AppointmentSlot> {
  return apiClient.post<AppointmentSlot>('/api/appointments/slots', request)
}

export function bookAppointment(slotId: number, employeeId: number): Promise<Appointment> {
  return apiClient.post<Appointment>('/api/appointments', { slotId, employeeId })
}

export function listAppointments(employeeId: number): Promise<Appointment[]> {
  return apiClient.get<Appointment[]>(`/api/appointments?employeeId=${employeeId}`)
}

// GET yalnızca ADMIN/IK'ya açık (bkz. AppointmentNoteController#getNote
// `@PreAuthorize`'ı) — 403 durumunda ApiError fırlatılır.
export function getAppointmentNote(appointmentId: number): Promise<AppointmentNote> {
  return apiClient.get<AppointmentNote>(`/api/appointments/${appointmentId}/note`)
}

export function updateAppointmentNote(appointmentId: number, note: string): Promise<AppointmentNote> {
  return apiClient.put<AppointmentNote>(`/api/appointments/${appointmentId}/note`, { note })
}
