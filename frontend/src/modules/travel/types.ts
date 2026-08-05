// Backend DTO'larıyla BİREBİR eşleşir (bkz. travel.dto.* — Bölüm 14.7/8B).

export type TravelRequest = {
  id: number
  employeeId: number
  location: string
  startDate: string
  endDate: string
  purpose: string
}

export type CreateTravelRequestRequest = {
  employeeId: number
  location: string
  startDate: string
  endDate: string
  purpose: string
}

export type ExpenseItemStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type ExpenseItem = {
  id: number
  travelRequestId: number
  amount: number
  documentFileName: string
  documentContentType: string
  status: ExpenseItemStatus
  rejectionReason: string | null
}

export type ExpenseItemDecisionRequest = {
  decision: 'APPROVED' | 'REJECTED'
  rejectionReason: string | null
}
