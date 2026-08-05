import { useQuery } from '@tanstack/react-query'
import { disciplineKeys } from '../queryKeys'
import * as disciplineApi from './disciplineApi'

export function useDisciplinaryCases(employeeId: number | undefined) {
  return useQuery({
    queryKey: disciplineKeys.cases.byEmployee(employeeId ?? 0),
    queryFn: () => disciplineApi.listDisciplinaryCases(employeeId ?? 0),
    enabled: !!employeeId,
  })
}
