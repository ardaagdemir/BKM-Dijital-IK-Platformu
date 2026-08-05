import { useQuery } from '@tanstack/react-query'
import { performanceKeys } from '../queryKeys'
import * as performanceApi from './performanceApi'

export function useCompetencies() {
  return useQuery({ queryKey: performanceKeys.competencies.list(), queryFn: performanceApi.listCompetencies })
}
