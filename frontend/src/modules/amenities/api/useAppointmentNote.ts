import { useQuery } from '@tanstack/react-query'
import { amenitiesKeys } from '../queryKeys'
import * as appointmentsApi from './appointmentsApi'

export function useAppointmentNote(appointmentId: number | null) {
  return useQuery({
    queryKey: amenitiesKeys.appointmentNote.byAppointment(appointmentId ?? 0),
    queryFn: () => appointmentsApi.getAppointmentNote(appointmentId!),
    enabled: appointmentId !== null,
  })
}
