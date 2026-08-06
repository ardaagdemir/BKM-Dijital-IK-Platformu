import { useQuery } from '@tanstack/react-query'
import { amenitiesKeys } from '../queryKeys'
import * as appointmentsApi from './appointmentsApi'

export function useAppointmentSlots(serviceOfferingId: number) {
  return useQuery({
    queryKey: amenitiesKeys.slots.byService(serviceOfferingId),
    queryFn: () => appointmentsApi.listAppointmentSlots(serviceOfferingId),
  })
}
