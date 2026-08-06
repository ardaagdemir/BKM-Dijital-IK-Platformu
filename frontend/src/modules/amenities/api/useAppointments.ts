import { useQuery } from '@tanstack/react-query'
import { amenitiesKeys } from '../queryKeys'
import * as appointmentsApi from './appointmentsApi'

export function useAppointments(employeeId: number) {
  return useQuery({
    queryKey: amenitiesKeys.appointments.byEmployee(employeeId),
    queryFn: () => appointmentsApi.listAppointments(employeeId),
  })
}
