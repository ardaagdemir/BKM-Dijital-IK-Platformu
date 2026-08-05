import { useMutation, useQueryClient } from '@tanstack/react-query'
import { feedbackKeys } from '../queryKeys'
import * as feedbackApi from './feedbackApi'

export function useCreateSuggestionCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => feedbackApi.createSuggestionCategory(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.suggestionCategories.list() })
    },
  })
}
