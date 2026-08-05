import { useMutation, useQueryClient } from '@tanstack/react-query'
import { organizationKeys } from '../queryKeys'
import type { AssignEmployeeRequest } from '../types'
import * as organizationApi from './organizationApi'

export function useAssignEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: AssignEmployeeRequest }) =>
      organizationApi.assignEmployee(id, request),
    onSuccess: (employee) => {
      queryClient.setQueryData(organizationKeys.employees.detail(employee.id), employee)
      queryClient.invalidateQueries({ queryKey: organizationKeys.employees.all })
    },
  })
}
