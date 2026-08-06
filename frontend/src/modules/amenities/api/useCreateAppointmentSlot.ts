import { useMutation, useQueryClient } from '@tanstack/react-query'
import { amenitiesKeys } from '../queryKeys'
import type { CreateAppointmentSlotRequest } from '../types'
import * as appointmentsApi from './appointmentsApi'

export function useCreateAppointmentSlot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateAppointmentSlotRequest) => appointmentsApi.createAppointmentSlot(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: amenitiesKeys.slots.byService(variables.serviceOfferingId) })
    },
  })
}
