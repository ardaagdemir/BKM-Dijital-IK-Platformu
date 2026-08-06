import { useQuery } from '@tanstack/react-query'
import { amenitiesKeys } from '../queryKeys'
import * as clubsApi from './clubsApi'

export function useClubEvents(clubId: number) {
  return useQuery({
    queryKey: amenitiesKeys.clubEvents.byClub(clubId),
    queryFn: () => clubsApi.listClubEvents(clubId),
  })
}
