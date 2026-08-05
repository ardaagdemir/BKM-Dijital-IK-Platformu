import { useMutation, useQueryClient } from '@tanstack/react-query'
import { disciplineKeys } from '../queryKeys'
import * as disciplineApi from './disciplineApi'

export function useCloseDisciplinaryCase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => disciplineApi.closeDisciplinaryCase(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: disciplineKeys.cases.revisions(id) })
      queryClient.invalidateQueries({ queryKey: disciplineKeys.cases.all })
    },
  })
}
