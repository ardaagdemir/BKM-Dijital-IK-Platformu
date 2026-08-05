import { useQuery } from '@tanstack/react-query'
import { disciplineKeys } from '../queryKeys'
import * as disciplineApi from './disciplineApi'

export function useAwards(employeeId: number | undefined) {
  return useQuery({
    queryKey: disciplineKeys.awards.byEmployee(employeeId ?? 0),
    queryFn: () => disciplineApi.listAwards(employeeId ?? 0),
    enabled: !!employeeId,
  })
}
