import { useMutation, useQueryClient } from '@tanstack/react-query'
import { performanceKeys } from '../queryKeys'
import type { GoalRequest } from '../types'
import * as performanceApi from './performanceApi'

export function useUpdateGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: GoalRequest }) => performanceApi.updateGoal(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.goals.list() })
    },
  })
}
