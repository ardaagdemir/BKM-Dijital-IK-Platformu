import { useMutation, useQueryClient } from '@tanstack/react-query'
import { recruitmentKeys } from '../queryKeys'
import type { CreateHiringRequestRequest } from '../types'
import * as recruitmentApi from './recruitmentApi'

export function useCreateHiringRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateHiringRequestRequest) => recruitmentApi.createHiringRequest(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.hiringRequests.all })
    },
  })
}
