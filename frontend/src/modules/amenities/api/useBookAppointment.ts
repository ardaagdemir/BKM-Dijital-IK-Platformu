import { useMutation, useQueryClient } from '@tanstack/react-query'
import { amenitiesKeys } from '../queryKeys'
import * as appointmentsApi from './appointmentsApi'

export function useBookAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ slotId, employeeId }: { slotId: number; employeeId: number }) =>
      appointmentsApi.bookAppointment(slotId, employeeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: amenitiesKeys.appointments.byEmployee(variables.employeeId) })
    },
  })
}
