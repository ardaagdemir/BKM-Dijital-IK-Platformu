import { useMutation, useQueryClient } from '@tanstack/react-query'
import { disciplineKeys } from '../queryKeys'
import type { CreateWarningRequest } from '../types'
import * as disciplineApi from './disciplineApi'

export function useCreateWarning() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateWarningRequest) => disciplineApi.createWarning(request),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: disciplineKeys.warnings.byEmployee(created.employeeId) })
    },
  })
}
