import { useQuery } from '@tanstack/react-query'
import { organizationKeys } from '../queryKeys'
import * as organizationApi from './organizationApi'

export function useUnits() {
  return useQuery({
    queryKey: organizationKeys.units.list(),
    queryFn: organizationApi.listUnits,
  })
}
