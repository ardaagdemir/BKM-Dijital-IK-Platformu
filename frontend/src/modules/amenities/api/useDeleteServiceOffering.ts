import { useMutation, useQueryClient } from '@tanstack/react-query'
import { amenitiesKeys } from '../queryKeys'
import * as appointmentsApi from './appointmentsApi'

export function useDeleteServiceOffering() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => appointmentsApi.deleteServiceOffering(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: amenitiesKeys.services.list() })
    },
  })
}
