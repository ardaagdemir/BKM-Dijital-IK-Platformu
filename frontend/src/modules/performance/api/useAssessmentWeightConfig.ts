import { useQuery } from '@tanstack/react-query'
import { performanceKeys } from '../queryKeys'
import * as performanceApi from './performanceApi'

export function useAssessmentWeightConfig() {
  return useQuery({
    queryKey: performanceKeys.weightConfig.all,
    queryFn: performanceApi.getAssessmentWeightConfig,
    retry: false,
  })
}
