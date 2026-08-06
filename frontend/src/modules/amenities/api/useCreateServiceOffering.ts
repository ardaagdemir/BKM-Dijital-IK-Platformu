import { useMutation, useQueryClient } from '@tanstack/react-query'
import { amenitiesKeys } from '../queryKeys'
import * as appointmentsApi from './appointmentsApi'

export function useCreateServiceOffering() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => appointmentsApi.createServiceOffering(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: amenitiesKeys.services.list() })
    },
  })
}
