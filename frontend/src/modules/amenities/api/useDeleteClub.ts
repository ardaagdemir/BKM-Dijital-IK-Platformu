import { useMutation, useQueryClient } from '@tanstack/react-query'
import { amenitiesKeys } from '../queryKeys'
import * as clubsApi from './clubsApi'

export function useDeleteClub() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => clubsApi.deleteClub(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: amenitiesKeys.clubs.list() })
    },
  })
}
