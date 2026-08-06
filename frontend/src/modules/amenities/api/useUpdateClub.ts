import { useMutation, useQueryClient } from '@tanstack/react-query'
import { amenitiesKeys } from '../queryKeys'
import type { ClubRequest } from '../types'
import * as clubsApi from './clubsApi'

export function useUpdateClub() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: ClubRequest }) => clubsApi.updateClub(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: amenitiesKeys.clubs.list() })
    },
  })
}
