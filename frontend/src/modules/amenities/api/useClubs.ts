import { useQuery } from '@tanstack/react-query'
import { amenitiesKeys } from '../queryKeys'
import * as clubsApi from './clubsApi'

export function useClubs() {
  return useQuery({ queryKey: amenitiesKeys.clubs.list(), queryFn: clubsApi.listClubs })
}
