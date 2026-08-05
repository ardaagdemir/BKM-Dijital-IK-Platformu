import { useMutation, useQueryClient } from '@tanstack/react-query'
import { feedbackKeys } from '../queryKeys'
import * as feedbackApi from './feedbackApi'

export function useUpdateSuggestionCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => feedbackApi.updateSuggestionCategory(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.suggestionCategories.list() })
    },
  })
}
