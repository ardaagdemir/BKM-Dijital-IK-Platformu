import { useQuery } from '@tanstack/react-query'
import { disciplineKeys } from '../queryKeys'
import * as disciplineApi from './disciplineApi'

export function useDisciplinaryCaseRevisions(id: number) {
  return useQuery({
    queryKey: disciplineKeys.cases.revisions(id),
    queryFn: () => disciplineApi.getDisciplinaryCaseRevisions(id),
  })
}
