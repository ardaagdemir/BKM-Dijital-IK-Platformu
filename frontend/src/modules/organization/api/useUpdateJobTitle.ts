import { useMutation, useQueryClient } from '@tanstack/react-query'
import { organizationKeys } from '../queryKeys'
import type { JobTitleRequest } from '../types'
import * as organizationApi from './organizationApi'

export function useUpdateJobTitle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: JobTitleRequest }) =>
      organizationApi.updateJobTitle(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.jobTitles.list() })
    },
  })
}
