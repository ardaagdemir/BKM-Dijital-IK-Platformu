import { useMutation, useQueryClient } from '@tanstack/react-query'
import { organizationKeys } from '../queryKeys'
import type { CreateEmployeeRequest } from '../types'
import * as organizationApi from './organizationApi'

export function useUpdateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: CreateEmployeeRequest }) =>
      organizationApi.updateEmployee(id, request),
    onSuccess: (employee) => {
      queryClient.setQueryData(organizationKeys.employees.detail(employee.id), employee)
      queryClient.invalidateQueries({ queryKey: organizationKeys.employees.all })
    },
  })
}
