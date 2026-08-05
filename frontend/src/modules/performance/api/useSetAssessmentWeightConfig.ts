import { useMutation, useQueryClient } from '@tanstack/react-query'
import { performanceKeys } from '../queryKeys'
import type { AssessmentWeightConfigRequest } from '../types'
import * as performanceApi from './performanceApi'

export function useSetAssessmentWeightConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: AssessmentWeightConfigRequest) => performanceApi.setAssessmentWeightConfig(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.weightConfig.all })
    },
  })
}
