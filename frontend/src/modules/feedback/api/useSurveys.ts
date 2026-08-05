import { useQuery } from '@tanstack/react-query'
import { feedbackKeys } from '../queryKeys'
import * as feedbackApi from './feedbackApi'

export function useSurveys() {
  return useQuery({ queryKey: feedbackKeys.surveys.list(), queryFn: feedbackApi.listSurveys })
}
