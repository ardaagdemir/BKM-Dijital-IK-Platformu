import { apiClient } from '../../../shared/api/apiClient'
import type {
  AssessmentScoreRequest,
  AssessmentWeightConfig,
  AssessmentWeightConfigRequest,
  Competency,
  CompetencyRequest,
  FinalScore,
  Goal,
  GoalRequest,
  ManagerAssessment,
  ManagerAssessmentSummary,
  RatingScale,
  RatingScaleRequest,
  SelfAssessment,
  SelfAssessmentFormData,
} from '../types'

export function listGoals(): Promise<Goal[]> {
  return apiClient.get<Goal[]>('/api/performance/goals')
}

export function createGoal(request: GoalRequest): Promise<Goal> {
  return apiClient.post<Goal>('/api/performance/goals', request)
}

export function updateGoal(id: number, request: GoalRequest): Promise<Goal> {
  return apiClient.put<Goal>(`/api/performance/goals/${id}`, request)
}

export function deleteGoal(id: number): Promise<void> {
  return apiClient.delete<void>(`/api/performance/goals/${id}`)
}

export function listCompetencies(): Promise<Competency[]> {
  return apiClient.get<Competency[]>('/api/performance/competencies')
}

export function createCompetency(request: CompetencyRequest): Promise<Competency> {
  return apiClient.post<Competency>('/api/performance/competencies', request)
}

export function updateCompetency(id: number, request: CompetencyRequest): Promise<Competency> {
  return apiClient.put<Competency>(`/api/performance/competencies/${id}`, request)
}

export function deleteCompetency(id: number): Promise<void> {
  return apiClient.delete<void>(`/api/performance/competencies/${id}`)
}

export function getRatingScale(): Promise<RatingScale> {
  return apiClient.get<RatingScale>('/api/performance/rating-scale')
}

export function setRatingScale(request: RatingScaleRequest): Promise<RatingScale> {
  return apiClient.put<RatingScale>('/api/performance/rating-scale', request)
}

export function getAssessmentWeightConfig(): Promise<AssessmentWeightConfig> {
  return apiClient.get<AssessmentWeightConfig>('/api/performance/assessment-weight-config')
}

export function setAssessmentWeightConfig(request: AssessmentWeightConfigRequest): Promise<AssessmentWeightConfig> {
  return apiClient.put<AssessmentWeightConfig>('/api/performance/assessment-weight-config', request)
}

export function getSelfAssessmentForm(): Promise<SelfAssessmentFormData> {
  return apiClient.get<SelfAssessmentFormData>('/api/performance/self-assessments/form')
}

export function submitSelfAssessment(employeeId: number, scores: AssessmentScoreRequest[]): Promise<SelfAssessment> {
  return apiClient.post<SelfAssessment>('/api/performance/self-assessments', { employeeId, scores })
}

export function submitManagerAssessment(
  employeeId: number,
  period: string,
  scores: AssessmentScoreRequest[],
  teamEmployeeIds?: number[],
): Promise<ManagerAssessment> {
  const query = new URLSearchParams()
  teamEmployeeIds?.forEach((id) => query.append('teamEmployeeIds', String(id)))
  const suffix = query.toString() ? `?${query.toString()}` : ''
  return apiClient.post<ManagerAssessment>(`/api/performance/manager-assessments${suffix}`, {
    employeeId,
    period,
    scores,
  })
}

export function listManagerAssessments(employeeId: number): Promise<ManagerAssessmentSummary[]> {
  return apiClient.get<ManagerAssessmentSummary[]>(`/api/performance/manager-assessments?employeeId=${employeeId}`)
}

export function getFinalScore(managerAssessmentId: number): Promise<FinalScore> {
  return apiClient.get<FinalScore>(`/api/performance/manager-assessments/${managerAssessmentId}/final-score`)
}
