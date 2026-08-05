import { useMutation, useQueryClient } from '@tanstack/react-query'
import { performanceKeys } from '../queryKeys'
import type { RatingScaleRequest } from '../types'
import * as performanceApi from './performanceApi'

export function useSetRatingScale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: RatingScaleRequest) => performanceApi.setRatingScale(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.ratingScale.all })
    },
  })
}
