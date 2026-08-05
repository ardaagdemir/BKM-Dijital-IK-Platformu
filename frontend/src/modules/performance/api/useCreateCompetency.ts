import { useMutation, useQueryClient } from '@tanstack/react-query'
import { performanceKeys } from '../queryKeys'
import type { CompetencyRequest } from '../types'
import * as performanceApi from './performanceApi'

export function useCreateCompetency() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CompetencyRequest) => performanceApi.createCompetency(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.competencies.list() })
    },
  })
}
