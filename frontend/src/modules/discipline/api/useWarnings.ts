import { useQuery } from '@tanstack/react-query'
import { disciplineKeys } from '../queryKeys'
import * as disciplineApi from './disciplineApi'

export function useWarnings(employeeId: number | undefined) {
  return useQuery({
    queryKey: disciplineKeys.warnings.byEmployee(employeeId ?? 0),
    queryFn: () => disciplineApi.listWarnings(employeeId ?? 0),
    enabled: !!employeeId,
  })
}
