import { useMutation, useQueryClient } from '@tanstack/react-query'
import { organizationKeys } from '../queryKeys'
import * as organizationApi from './organizationApi'

export function useCreateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: organizationApi.createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.employees.all })
    },
  })
}
