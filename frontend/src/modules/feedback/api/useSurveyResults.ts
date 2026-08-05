import { useQuery } from '@tanstack/react-query'
import { feedbackKeys } from '../queryKeys'
import * as feedbackApi from './feedbackApi'

export function useSurveyResults(surveyId: number) {
  return useQuery({
    queryKey: feedbackKeys.surveys.results(surveyId),
    queryFn: () => feedbackApi.getSurveyResults(surveyId),
  })
}
