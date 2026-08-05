import { useMutation, useQueryClient } from '@tanstack/react-query'
import { feedbackKeys } from '../queryKeys'
import type { CreateSurveyRequest } from '../types'
import * as feedbackApi from './feedbackApi'

export function useCreateSurvey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateSurveyRequest) => feedbackApi.createSurvey(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.surveys.list() })
    },
  })
}
