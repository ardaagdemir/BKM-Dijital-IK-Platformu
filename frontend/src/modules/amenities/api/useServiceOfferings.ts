import { useQuery } from '@tanstack/react-query'
import { amenitiesKeys } from '../queryKeys'
import * as appointmentsApi from './appointmentsApi'

export function useServiceOfferings() {
  return useQuery({ queryKey: amenitiesKeys.services.list(), queryFn: appointmentsApi.listServiceOfferings })
}
