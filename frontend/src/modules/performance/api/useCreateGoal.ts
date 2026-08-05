import { useMutation, useQueryClient } from '@tanstack/react-query'
import { performanceKeys } from '../queryKeys'
import type { GoalRequest } from '../types'
import * as performanceApi from './performanceApi'

export function useCreateGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: GoalRequest) => performanceApi.createGoal(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.goals.list() })
    },
  })
}
