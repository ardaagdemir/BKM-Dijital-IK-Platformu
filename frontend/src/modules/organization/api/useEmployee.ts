import { useQuery } from '@tanstack/react-query'
import { organizationKeys } from '../queryKeys'
import * as organizationApi from './organizationApi'

export function useEmployee(id: number) {
  return useQuery({
    queryKey: organizationKeys.employees.detail(id),
    queryFn: () => organizationApi.getEmployee(id),
    enabled: Number.isFinite(id),
  })
}
