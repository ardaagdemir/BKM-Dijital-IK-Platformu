// Backend DTO'larıyla BİREBİR eşleşir (bkz. amenities.dto.* — Bölüm 14.7/8G-8H).

export type Club = {
  id: number
  name: string
  leaderId: number | null
}

export type ClubRequest = {
  name: string
  leaderId: number | null
}

export type ClubMembershipRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type ClubMembershipRequest = {
  id: number
  clubId: number
  employeeId: number
  status: ClubMembershipRequestStatus
  rejectionReason: string | null
}

export type ClubEvent = {
  id: number
  clubId: number
  name: string
  date: string
}

export type CreateClubEventRequest = {
  clubId: number
  employeeId: number
  name: string
  date: string
}

export type ServiceOffering = {
  id: number
  name: string
}

export type AppointmentSlot = {
  id: number
  serviceOfferingId: number
  startTime: string
  endTime: string
}

export type CreateAppointmentSlotRequest = {
  serviceOfferingId: number
  startTime: string
  endTime: string
}

export type Appointment = {
  id: number
  slotId: number
  employeeId: number
}

export type AppointmentNote = {
  appointmentId: number
  note: string | null
}
