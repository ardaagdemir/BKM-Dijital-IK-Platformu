import { useMutation, useQueryClient } from '@tanstack/react-query'
import { amenitiesKeys } from '../queryKeys'
import type { CreateClubEventRequest } from '../types'
import * as clubsApi from './clubsApi'

export function useCreateClubEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateClubEventRequest) => clubsApi.createClubEvent(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: amenitiesKeys.clubEvents.byClub(variables.clubId) })
    },
  })
}
