// Backend DTO'larıyla BİREBİR eşleşir (bkz. discipline.dto.* — Bölüm 14.7/8C).

export type Warning = {
  id: number
  employeeId: number
  date: string
  reason: string
  description: string
}

export type CreateWarningRequest = {
  employeeId: number
  date: string
  reason: string
  description: string
}

export type DisciplinaryCaseStatus = 'OPEN' | 'CLOSED'

export type DisciplinaryCase = {
  id: number
  employeeId: number
  reason: string
  defense: string | null
  status: DisciplinaryCaseStatus
}

export type DisciplinaryCaseRevision = {
  id: number
  reason: string
  defense: string | null
  status: DisciplinaryCaseStatus
  createdAt: string
}

export type Award = {
  id: number
  employeeId: number
  type: string
  description: string
}

export type CreateAwardRequest = {
  employeeId: number
  type: string
  description: string
}
