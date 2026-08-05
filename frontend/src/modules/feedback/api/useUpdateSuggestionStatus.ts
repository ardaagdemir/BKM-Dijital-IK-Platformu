import { useMutation, useQueryClient } from '@tanstack/react-query'
import { feedbackKeys } from '../queryKeys'
import * as feedbackApi from './feedbackApi'

export function useUpdateSuggestionStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => feedbackApi.updateSuggestionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.suggestions.all })
    },
  })
}
