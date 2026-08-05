import { useMutation, useQueryClient } from '@tanstack/react-query'
import { feedbackKeys } from '../queryKeys'
import * as feedbackApi from './feedbackApi'

export function useDeleteSuggestionCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => feedbackApi.deleteSuggestionCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.suggestionCategories.list() })
    },
  })
}
