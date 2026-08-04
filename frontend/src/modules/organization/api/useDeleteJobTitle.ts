import { useMutation, useQueryClient } from '@tanstack/react-query'
import { organizationKeys } from '../queryKeys'
import * as organizationApi from './organizationApi'

export function useDeleteJobTitle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: organizationApi.deleteJobTitle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.jobTitles.list() })
    },
  })
}
