import { useQuery } from '@tanstack/react-query'
import { trainingKeys } from '../queryKeys'
import * as trainingApi from './trainingApi'

export function useCompletedTrainings(employeeId?: number) {
  return useQuery({
    queryKey: trainingKeys.completed.list(employeeId),
    queryFn: () => trainingApi.listCompletedTrainings(employeeId),
  })
}
