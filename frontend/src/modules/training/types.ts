// Backend DTO'larıyla BİREBİR eşleşir (bkz. training.dto.* — Bölüm 14.7/8A).

export type Training = {
  id: number
  name: string
  type: string
  durationHours: number
  provider: string
}

export type TrainingRequest = {
  name: string
  type: string
  durationHours: number
  provider: string
}

export type TrainingEnrollmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'

export type TrainingEnrollment = {
  id: number
  employeeId: number
  trainingId: number
  status: TrainingEnrollmentStatus
  rejectionReason: string | null
  completedDate: string | null
}

export type CreateTrainingEnrollmentRequest = {
  employeeId: number
  trainingId: number
}

export type TrainingEnrollmentDecisionRequest = {
  decision: 'APPROVED' | 'REJECTED'
  rejectionReason: string | null
}

export type CompletedTraining = {
  employeeId: number
  trainingId: number
  trainingName: string
  completedDate: string
}
