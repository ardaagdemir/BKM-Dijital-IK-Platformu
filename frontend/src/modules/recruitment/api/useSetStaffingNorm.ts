import { useMutation, useQueryClient } from '@tanstack/react-query'
import { recruitmentKeys } from '../queryKeys'
import type { StaffingNormRequest } from '../types'
import * as recruitmentApi from './recruitmentApi'

export function useSetStaffingNorm() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: StaffingNormRequest) => recruitmentApi.setStaffingNorm(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.staffingNorms.list() })
    },
  })
}
