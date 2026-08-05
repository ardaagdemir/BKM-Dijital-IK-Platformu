// Backend DTO'larıyla BİREBİR eşleşir (bkz. performance.dto.* — Bölüm 14.5).

export type Goal = {
  id: number
  name: string
  weight: number
}

export type GoalRequest = {
  name: string
  weight: number
}

export type Competency = {
  id: number
  name: string
  weight: number
}

export type CompetencyRequest = {
  name: string
  weight: number
}

export type RatingScale = {
  id: number
  minValue: number
  maxValue: number
}

export type RatingScaleRequest = {
  minValue: number
  maxValue: number
}

export type AssessmentWeightConfig = {
  id: number
  goalWeight: number
  competencyWeight: number
}

export type AssessmentWeightConfigRequest = {
  goalWeight: number
  competencyWeight: number
}

export type AssessmentItemType = 'GOAL' | 'COMPETENCY'

export type SelfAssessmentFormData = {
  goals: Goal[]
  competencies: Competency[]
  scale: RatingScale
}

export type AssessmentScoreRequest = {
  itemType: AssessmentItemType
  itemId: number
  score: number
}

export type AssessmentScore = {
  id: number
  itemType: AssessmentItemType
  itemId: number
  score: number
}

export type SelfAssessment = {
  id: number
  employeeId: number
  scores: AssessmentScore[]
}

export type ManagerAssessment = {
  id: number
  employeeId: number
  period: string
  scores: AssessmentScore[]
}

export type ManagerAssessmentSummary = {
  id: number
  employeeId: number
  period: string
  finalScore: number | null
}

export type FinalScore = {
  managerAssessmentId: number
  goalScore: number | null
  competencyScore: number | null
  goalWeight: number
  competencyWeight: number
  finalScore: number
}
