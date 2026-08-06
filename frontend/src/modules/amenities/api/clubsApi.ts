import { apiClient } from '../../../shared/api/apiClient'
import type { Club, ClubEvent, ClubMembershipRequest, ClubRequest, CreateClubEventRequest } from '../types'

export function listClubs(): Promise<Club[]> {
  return apiClient.get<Club[]>('/api/clubs')
}

export function createClub(request: ClubRequest): Promise<Club> {
  return apiClient.post<Club>('/api/clubs', request)
}

export function updateClub(id: number, request: ClubRequest): Promise<Club> {
  return apiClient.put<Club>(`/api/clubs/${id}`, request)
}

export function deleteClub(id: number): Promise<void> {
  return apiClient.delete<void>(`/api/clubs/${id}`)
}

export function createMembershipRequest(clubId: number, employeeId: number): Promise<ClubMembershipRequest> {
  return apiClient.post<ClubMembershipRequest>('/api/clubs/membership-requests', { clubId, employeeId })
}

// `employeeId` verilmezse (İK'nın karara bağlayacağı talebi bulabilmesi
// için) TÜM talepler döner (bkz. ClubMembershipRequestService.list).
export function listMembershipRequests(employeeId?: number): Promise<ClubMembershipRequest[]> {
  const suffix = employeeId !== undefined ? `?employeeId=${employeeId}` : ''
  return apiClient.get<ClubMembershipRequest[]>(`/api/clubs/membership-requests${suffix}`)
}

export function decideMembershipRequest(
  id: number,
  status: 'APPROVED' | 'REJECTED',
  rejectionReason: string | null,
): Promise<ClubMembershipRequest> {
  return apiClient.put<ClubMembershipRequest>(`/api/clubs/membership-requests/${id}/decision`, {
    status,
    rejectionReason,
  })
}

export function listClubEvents(clubId: number): Promise<ClubEvent[]> {
  return apiClient.get<ClubEvent[]>(`/api/clubs/events?clubId=${clubId}`)
}

export function createClubEvent(request: CreateClubEventRequest): Promise<ClubEvent> {
  return apiClient.post<ClubEvent>('/api/clubs/events', request)
}
