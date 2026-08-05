import { useMutation, useQueryClient } from '@tanstack/react-query'
import { performanceKeys } from '../queryKeys'
import * as performanceApi from './performanceApi'

export function useDeleteGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => performanceApi.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.goals.list() })
    },
  })
}
