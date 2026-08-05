import { useMutation, useQueryClient } from '@tanstack/react-query'
import { performanceKeys } from '../queryKeys'
import type { CompetencyRequest } from '../types'
import * as performanceApi from './performanceApi'

export function useUpdateCompetency() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: CompetencyRequest }) =>
      performanceApi.updateCompetency(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.competencies.list() })
    },
  })
}
