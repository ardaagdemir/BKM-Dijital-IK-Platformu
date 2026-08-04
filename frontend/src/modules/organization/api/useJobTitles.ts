import { useQuery } from '@tanstack/react-query'
import { organizationKeys } from '../queryKeys'
import * as organizationApi from './organizationApi'

export function useJobTitles() {
  return useQuery({
    queryKey: organizationKeys.jobTitles.list(),
    queryFn: organizationApi.listJobTitles,
  })
}
