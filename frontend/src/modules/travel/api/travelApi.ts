import { apiClient } from '../../../shared/api/apiClient'
import type {
  CreateTravelRequestRequest,
  ExpenseItem,
  ExpenseItemDecisionRequest,
  TravelRequest,
} from '../types'

export function createTravelRequest(request: CreateTravelRequestRequest): Promise<TravelRequest> {
  return apiClient.post<TravelRequest>('/api/travel/requests', request)
}

export function listTravelRequests(employeeId: number): Promise<TravelRequest[]> {
  return apiClient.get<TravelRequest[]>(`/api/travel/requests?employeeId=${employeeId}`)
}

export function getTravelRequest(id: number, employeeId: number): Promise<TravelRequest | undefined> {
  return listTravelRequests(employeeId).then((requests) => requests.find((request) => request.id === id))
}

export function listExpenseItems(travelRequestId: number): Promise<ExpenseItem[]> {
  return apiClient.get<ExpenseItem[]>(`/api/travel/requests/${travelRequestId}/expense-items`)
}

// `recruitment.applyAsCandidate`'teki AYNI multipart deseni.
export function createExpenseItem(params: { travelRequestId: number; amount: string; document: File }): Promise<ExpenseItem> {
  const formData = new FormData()
  formData.set('amount', params.amount)
  formData.set('document', params.document)
  return apiClient.postMultipart<ExpenseItem>(`/api/travel/requests/${params.travelRequestId}/expense-items`, formData)
}

export function downloadExpenseItemDocument(travelRequestId: number, expenseItemId: number): Promise<Blob> {
  return apiClient.getBlob(`/api/travel/requests/${travelRequestId}/expense-items/${expenseItemId}/document`)
}

export function decideExpenseItem(
  travelRequestId: number,
  id: number,
  request: ExpenseItemDecisionRequest,
): Promise<ExpenseItem> {
  return apiClient.put<ExpenseItem>(`/api/travel/requests/${travelRequestId}/expense-items/${id}/decision`, request)
}
