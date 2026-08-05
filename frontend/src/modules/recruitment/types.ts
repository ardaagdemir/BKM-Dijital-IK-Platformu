// Backend DTO'larıyla BİREBİR eşleşir (bkz. recruitment.dto.* — Bölüm 14.4).

export type StaffingNorm = {
  id: number
  organizationUnitId: number
  jobTitleId: number
  normCount: number
}

export type StaffingNormRequest = {
  organizationUnitId: number
  jobTitleId: number
  normCount: number
}

export type CandidateStage = 'APPLICATION' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED'

export type Candidate = {
  id: number
  firstName: string
  lastName: string
  email: string
  appliedPosition: string
  cvFileName: string
  stage: CandidateStage
  converted: boolean
}

export type CandidateNote = {
  id: number
  candidateId: number
  noteText: string
}

export type Interview = {
  id: number
  candidateId: number
  interviewDate: string
  participants: string
  result: string
}

export type CreateInterviewRequest = {
  interviewDate: string
  participants: string
  result: string
}

export type EmployeeDraft = {
  candidateId: number
  firstName: string
  lastName: string
  email: string
}

export type HiringRequestStatus = 'PENDING' | 'MANAGER_APPROVED' | 'APPROVED' | 'REJECTED'

export type HiringRequest = {
  id: number
  organizationUnitId: number
  jobTitleId: number
  status: HiringRequestStatus
}

export type CreateHiringRequestRequest = {
  organizationUnitId: number
  jobTitleId: number
}
