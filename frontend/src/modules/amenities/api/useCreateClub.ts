import { useMutation, useQueryClient } from '@tanstack/react-query'
import { amenitiesKeys } from '../queryKeys'
import type { ClubRequest } from '../types'
import * as clubsApi from './clubsApi'

export function useCreateClub() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: ClubRequest) => clubsApi.createClub(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: amenitiesKeys.clubs.list() })
    },
  })
}
