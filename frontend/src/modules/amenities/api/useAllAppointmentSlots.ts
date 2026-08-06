import { useQueries } from '@tanstack/react-query'
import { amenitiesKeys } from '../queryKeys'
import type { ServiceOffering } from '../types'
import * as appointmentsApi from './appointmentsApi'

// `GET /api/appointments/slots` bir `serviceOfferingId` OLMADAN
// çağrılamaz (bkz. AppointmentSlotService.listByService — "Hizmet boş
// olamaz." fırlatır); "tüm slotlar" listesi olmadığından, HER hizmet için
// AYRI sorgu birleştirilir — `training.TrainingApprovalsPage`'deki AYNI
// `useQueries` N+1 birleştirme deseni.
export function useAllAppointmentSlots(services: ServiceOffering[]) {
  const slotQueries = useQueries({
    queries: services.map((service) => ({
      queryKey: amenitiesKeys.slots.byService(service.id),
      queryFn: () => appointmentsApi.listAppointmentSlots(service.id),
    })),
  })

  return {
    isPending: slotQueries.some((query) => query.isPending),
    isError: slotQueries.some((query) => query.isError),
    slots: slotQueries.flatMap((query) => query.data ?? []),
  }
}
