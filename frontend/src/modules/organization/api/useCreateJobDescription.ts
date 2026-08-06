import { useMutation, useQueryClient } from '@tanstack/react-query'
import { organizationKeys } from '../queryKeys'
import type { CreateJobDescriptionRequest } from '../types'
import * as organizationApi from './organizationApi'

export function useCreateJobDescription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateJobDescriptionRequest) => organizationApi.createJobDescription(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.jobDescriptions.byJobTitle(variables.jobTitleId) })
    },
  })
}
