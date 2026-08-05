import { useMutation, useQueryClient } from '@tanstack/react-query'
import { disciplineKeys } from '../queryKeys'
import type { CreateAwardRequest } from '../types'
import * as disciplineApi from './disciplineApi'

export function useCreateAward() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateAwardRequest) => disciplineApi.createAward(request),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: disciplineKeys.awards.byEmployee(created.employeeId) })
    },
  })
}
