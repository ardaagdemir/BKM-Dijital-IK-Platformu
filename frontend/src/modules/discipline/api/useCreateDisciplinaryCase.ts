import { useMutation, useQueryClient } from '@tanstack/react-query'
import { disciplineKeys } from '../queryKeys'
import * as disciplineApi from './disciplineApi'

export function useCreateDisciplinaryCase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ employeeId, reason }: { employeeId: number; reason: string }) =>
      disciplineApi.createDisciplinaryCase(employeeId, reason),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: disciplineKeys.cases.byEmployee(created.employeeId) })
    },
  })
}
