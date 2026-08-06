import { useQuery } from '@tanstack/react-query'
import { organizationKeys } from '../queryKeys'
import * as organizationApi from './organizationApi'

export function useJobDescriptions(jobTitleId: number) {
  return useQuery({
    queryKey: organizationKeys.jobDescriptions.byJobTitle(jobTitleId),
    queryFn: () => organizationApi.listJobDescriptions(jobTitleId),
  })
}
