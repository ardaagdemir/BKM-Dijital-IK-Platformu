import { useQuery } from '@tanstack/react-query'
import { organizationKeys } from '../queryKeys'
import * as organizationApi from './organizationApi'

export function useEmployeeAssets(employeeId: number) {
  return useQuery({
    queryKey: organizationKeys.employees.assets(employeeId),
    queryFn: () => organizationApi.listEmployeeAssets(employeeId),
    enabled: Number.isFinite(employeeId),
  })
}
