import { useMutation } from '@tanstack/react-query'
import type { SubmitSurveyAnswerRequest } from '../types'
import * as feedbackApi from './feedbackApi'

// Sonuç ekranına (`/surveys/:id/results`) ADMIN/IK dışındaki roller erişemediği
// için `feedbackKeys.surveys.results` invalidasyonu GEREKSİZ — yalnızca
// anket listesini etkilemez, o yüzden hiçbir query invalidasyonu YOK.
export function useSubmitSurveyAnswer(surveyId: number) {
  return useMutation({
    mutationFn: (request: SubmitSurveyAnswerRequest) => feedbackApi.submitSurveyAnswer(surveyId, request),
  })
}
