import { useMutation, useQueryClient } from '@tanstack/react-query'
import { travelKeys } from '../queryKeys'
import type { CreateTravelRequestRequest } from '../types'
import * as travelApi from './travelApi'

export function useCreateTravelRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateTravelRequestRequest) => travelApi.createTravelRequest(request),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: travelKeys.requests.byEmployee(created.employeeId) })
    },
  })
}
