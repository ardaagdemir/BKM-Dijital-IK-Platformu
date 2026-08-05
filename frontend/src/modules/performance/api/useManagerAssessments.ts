import { useQuery } from '@tanstack/react-query'
import { performanceKeys } from '../queryKeys'
import * as performanceApi from './performanceApi'

export function useManagerAssessments(employeeId: number) {
  return useQuery({
    queryKey: performanceKeys.managerAssessments.byEmployee(employeeId),
    queryFn: () => performanceApi.listManagerAssessments(employeeId),
  })
}
