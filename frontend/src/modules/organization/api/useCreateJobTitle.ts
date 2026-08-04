import { useMutation, useQueryClient } from '@tanstack/react-query'
import { organizationKeys } from '../queryKeys'
import * as organizationApi from './organizationApi'

export function useCreateJobTitle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: organizationApi.createJobTitle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.jobTitles.list() })
    },
  })
}
