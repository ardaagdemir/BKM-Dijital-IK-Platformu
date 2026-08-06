import { useMutation, useQueryClient } from '@tanstack/react-query'
import { amenitiesKeys } from '../queryKeys'
import * as appointmentsApi from './appointmentsApi'

export function useUpdateAppointmentNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ appointmentId, note }: { appointmentId: number; note: string }) =>
      appointmentsApi.updateAppointmentNote(appointmentId, note),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: amenitiesKeys.appointmentNote.byAppointment(variables.appointmentId) })
    },
  })
}
