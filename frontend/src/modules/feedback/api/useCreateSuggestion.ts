import { useMutation, useQueryClient } from '@tanstack/react-query'
import { feedbackKeys } from '../queryKeys'
import type { CreateSuggestionRequest } from '../types'
import * as feedbackApi from './feedbackApi'

export function useCreateSuggestion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateSuggestionRequest) => feedbackApi.createSuggestion(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.suggestions.all })
    },
  })
}
