import { useMutation, useQueryClient } from '@tanstack/react-query'
import { performanceKeys } from '../queryKeys'
import * as performanceApi from './performanceApi'

export function useDeleteCompetency() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => performanceApi.deleteCompetency(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.competencies.list() })
    },
  })
}
