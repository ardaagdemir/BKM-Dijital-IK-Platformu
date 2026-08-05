import { useMutation, useQueryClient } from '@tanstack/react-query'
import { disciplineKeys } from '../queryKeys'
import * as disciplineApi from './disciplineApi'

export function useRecordDefense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, defense }: { id: number; defense: string }) => disciplineApi.recordDefense(id, defense),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: disciplineKeys.cases.revisions(id) })
      queryClient.invalidateQueries({ queryKey: disciplineKeys.cases.all })
    },
  })
}
