import { useQuery } from '@tanstack/react-query'
import { performanceKeys } from '../queryKeys'
import * as performanceApi from './performanceApi'

export function useGoals() {
  return useQuery({ queryKey: performanceKeys.goals.list(), queryFn: performanceApi.listGoals })
}
