import { useQuery } from '@tanstack/react-query'
import { trainingKeys } from '../queryKeys'
import * as trainingApi from './trainingApi'

export function useEnrollments(employeeId: number | undefined) {
  return useQuery({
    queryKey: trainingKeys.enrollments.byEmployee(employeeId ?? 0),
    queryFn: () => trainingApi.listEnrollments(employeeId ?? 0),
    enabled: !!employeeId,
  })
}
