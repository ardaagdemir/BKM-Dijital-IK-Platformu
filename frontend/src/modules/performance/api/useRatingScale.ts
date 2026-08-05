import { useQuery } from '@tanstack/react-query'
import { performanceKeys } from '../queryKeys'
import * as performanceApi from './performanceApi'

export function useRatingScale() {
  return useQuery({ queryKey: performanceKeys.ratingScale.all, queryFn: performanceApi.getRatingScale, retry: false })
}
