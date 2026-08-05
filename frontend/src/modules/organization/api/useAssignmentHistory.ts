import { useQuery } from '@tanstack/react-query'
import { organizationKeys } from '../queryKeys'
import * as organizationApi from './organizationApi'

export function useAssignmentHistory(employeeId: number) {
  return useQuery({
    queryKey: organizationKeys.employees.assignmentHistory(employeeId),
    queryFn: () => organizationApi.listAssignmentHistory(employeeId),
    enabled: Number.isFinite(employeeId),
  })
}
