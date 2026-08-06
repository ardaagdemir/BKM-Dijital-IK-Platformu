import { useMutation, useQueryClient } from '@tanstack/react-query'
import { amenitiesKeys } from '../queryKeys'
import * as appointmentsApi from './appointmentsApi'

export function useUpdateServiceOffering() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => appointmentsApi.updateServiceOffering(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: amenitiesKeys.services.list() })
    },
  })
}
