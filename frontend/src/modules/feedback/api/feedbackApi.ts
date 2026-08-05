import { apiClient } from '../../../shared/api/apiClient'
import type {
  CreateSuggestionRequest,
  CreateSurveyRequest,
  Suggestion,
  SuggestionCategory,
  Survey,
  SurveyAnswer,
  SurveyResult,
  SubmitSurveyAnswerRequest,
} from '../types'

export function listSurveys(): Promise<Survey[]> {
  return apiClient.get<Survey[]>('/api/surveys')
}

export function createSurvey(request: CreateSurveyRequest): Promise<Survey> {
  return apiClient.post<Survey>('/api/surveys', request)
}

export function submitSurveyAnswer(surveyId: number, request: SubmitSurveyAnswerRequest): Promise<SurveyAnswer> {
  return apiClient.post<SurveyAnswer>(`/api/surveys/${surveyId}/answers`, request)
}

export function getSurveyResults(surveyId: number): Promise<SurveyResult> {
  return apiClient.get<SurveyResult>(`/api/surveys/${surveyId}/results`)
}

export function listSuggestionCategories(): Promise<SuggestionCategory[]> {
  return apiClient.get<SuggestionCategory[]>('/api/suggestions/categories')
}

export function createSuggestionCategory(name: string): Promise<SuggestionCategory> {
  return apiClient.post<SuggestionCategory>('/api/suggestions/categories', { name })
}

export function updateSuggestionCategory(id: number, name: string): Promise<SuggestionCategory> {
  return apiClient.put<SuggestionCategory>(`/api/suggestions/categories/${id}`, { name })
}

export function deleteSuggestionCategory(id: number): Promise<void> {
  return apiClient.delete<void>(`/api/suggestions/categories/${id}`)
}

export function createSuggestion(request: CreateSuggestionRequest): Promise<Suggestion> {
  return apiClient.post<Suggestion>('/api/suggestions', request)
}

// `employeeId` verilmezse (İK yönetim ekranı) TÜM talepler döner —
// anonim olanlar dahil (bkz. SuggestionService.list).
export function listSuggestions(employeeId?: number): Promise<Suggestion[]> {
  const suffix = employeeId !== undefined ? `?employeeId=${employeeId}` : ''
  return apiClient.get<Suggestion[]>(`/api/suggestions${suffix}`)
}

export function updateSuggestionStatus(id: number, status: string): Promise<Suggestion> {
  return apiClient.put<Suggestion>(`/api/suggestions/${id}/status`, { status })
}
