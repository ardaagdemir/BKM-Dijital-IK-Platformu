import { apiClient } from '../../../shared/api/apiClient'
import type {
  Candidate,
  CandidateNote,
  CandidateStage,
  CreateHiringRequestRequest,
  CreateInterviewRequest,
  EmployeeDraft,
  HiringRequest,
  Interview,
  StaffingNorm,
  StaffingNormRequest,
} from '../types'

export function setStaffingNorm(request: StaffingNormRequest): Promise<StaffingNorm> {
  return apiClient.put<StaffingNorm>('/api/recruitment/staffing-norms', request)
}

export function listStaffingNorms(): Promise<StaffingNorm[]> {
  return apiClient.get<StaffingNorm[]>('/api/recruitment/staffing-norms')
}

// `/careers/apply` — kimlik doğrulaması GEREKTİRMEZ (bkz.
// `auth.SecurityConfig`'teki `permitAll` kuralı), bu yüzden
// `apiClient.postMultipart` (Authorization header'ı token VARSA ekler, YOKSA
// hiç sorun çıkarmaz — backend zaten kimliksiz erişime izin veriyor).
export function applyAsCandidate(params: {
  firstName: string
  lastName: string
  email: string
  appliedPosition: string
  cv: File
}): Promise<Candidate> {
  const formData = new FormData()
  formData.set('firstName', params.firstName)
  formData.set('lastName', params.lastName)
  formData.set('email', params.email)
  formData.set('appliedPosition', params.appliedPosition)
  formData.set('cv', params.cv)
  return apiClient.postMultipart<Candidate>('/api/recruitment/candidates/applications', formData)
}

export function listCandidates(): Promise<Candidate[]> {
  return apiClient.get<Candidate[]>('/api/recruitment/candidates')
}

export function getCandidate(id: number): Promise<Candidate> {
  return apiClient.get<Candidate>(`/api/recruitment/candidates/${id}`)
}

export function downloadCandidateCv(id: number): Promise<Blob> {
  return apiClient.getBlob(`/api/recruitment/candidates/${id}/cv`)
}

export function changeCandidateStage(id: number, stage: CandidateStage): Promise<Candidate> {
  return apiClient.put<Candidate>(`/api/recruitment/candidates/${id}/stage`, { stage })
}

export function convertCandidateToEmployee(id: number): Promise<EmployeeDraft> {
  return apiClient.post<EmployeeDraft>(`/api/recruitment/candidates/${id}/convert-to-employee`)
}

export function listCandidateNotes(candidateId: number): Promise<CandidateNote[]> {
  return apiClient.get<CandidateNote[]>(`/api/recruitment/candidates/${candidateId}/notes`)
}

export function addCandidateNote(candidateId: number, noteText: string): Promise<CandidateNote> {
  return apiClient.post<CandidateNote>(`/api/recruitment/candidates/${candidateId}/notes`, { noteText })
}

export function listInterviews(candidateId: number): Promise<Interview[]> {
  return apiClient.get<Interview[]>(`/api/recruitment/candidates/${candidateId}/interviews`)
}

export function createInterview(candidateId: number, request: CreateInterviewRequest): Promise<Interview> {
  return apiClient.post<Interview>(`/api/recruitment/candidates/${candidateId}/interviews`, request)
}

export function createHiringRequest(request: CreateHiringRequestRequest): Promise<HiringRequest> {
  return apiClient.post<HiringRequest>('/api/recruitment/hiring-requests', request)
}

// `organizationUnitId` VERİLMEZSE tüm talepler (İK'nın organizasyon geneli
// görünümü), VERİLİRSE o birimle sınırlı (YONETICI'nin kendi ekibi — bkz.
// `HiringRequestService.getAll`'daki AYNI gerekçe).
export function listHiringRequests(organizationUnitId?: number): Promise<HiringRequest[]> {
  const suffix = organizationUnitId !== undefined ? `?organizationUnitId=${organizationUnitId}` : ''
  return apiClient.get<HiringRequest[]>(`/api/recruitment/hiring-requests${suffix}`)
}

// `teamOrganizationUnitIds`: YONETICI için ZORUNLU — `leaveApi.decideLeaveRequest`'teki
// AYNI güven-sınırı deseni (bkz. `HiringRequestAccessGuard`). ADMIN/IK için gerekmez.
export function managerDecideHiringRequest(
  id: number,
  decision: 'APPROVED' | 'REJECTED',
  teamOrganizationUnitIds?: number[],
): Promise<HiringRequest> {
  const query = new URLSearchParams()
  teamOrganizationUnitIds?.forEach((unitId) => query.append('teamOrganizationUnitIds', String(unitId)))
  const suffix = query.toString() ? `?${query.toString()}` : ''
  return apiClient.put<HiringRequest>(`/api/recruitment/hiring-requests/${id}/manager-decision${suffix}`, {
    decision,
  })
}

export function hrDecideHiringRequest(id: number, decision: 'APPROVED' | 'REJECTED'): Promise<HiringRequest> {
  return apiClient.put<HiringRequest>(`/api/recruitment/hiring-requests/${id}/hr-decision`, { decision })
}
