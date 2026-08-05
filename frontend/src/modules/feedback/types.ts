// Backend DTO'larıyla BİREBİR eşleşir (bkz. feedback.dto.* — Bölüm 14.7/8E-8F).

export type SurveyOption = {
  id: number
  text: string
}

export type Survey = {
  id: number
  question: string
  options: SurveyOption[]
  anonymous: boolean
}

export type CreateSurveyRequest = {
  question: string
  options: string[]
  anonymous: boolean
}

// `employeeId`, anket anonim İSE backend tarafından HİÇ kaydedilmez
// (bkz. SurveyAnswerService.submit) — istemci yine de gönderebilir,
// backend göz ardı eder.
export type SubmitSurveyAnswerRequest = {
  surveyOptionId: number
  employeeId: number | null
}

export type SurveyAnswer = {
  id: number
  surveyId: number
  surveyOptionId: number
  employeeId: number | null
}

export type SurveyOptionResult = {
  optionId: number
  text: string
  voteCount: number
  percentage: number
}

export type SurveyResult = {
  surveyId: number
  question: string
  totalResponses: number
  options: SurveyOptionResult[]
}

export type SuggestionCategory = {
  id: number
  name: string
}

// Roadmap'in AÇIKÇA listelediği 3 durum (bkz. SuggestionStatus.java'nın AYNI
// notu) — FR-802'nin 4 aşamalı akışı BİLİNÇLİ OLARAK taşınmadı.
export type SuggestionStatus = 'PENDING' | 'APPROVED' | 'COMPLETED'

export type Suggestion = {
  id: number
  categoryId: number
  employeeId: number | null
  description: string
  status: SuggestionStatus
}

export type CreateSuggestionRequest = {
  categoryId: number
  description: string
  employeeId: number | null
  anonymous: boolean
}
