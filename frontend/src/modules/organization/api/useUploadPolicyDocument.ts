import { useMutation, useQueryClient } from '@tanstack/react-query'
import { organizationKeys } from '../queryKeys'
import * as organizationApi from './organizationApi'

export function useUploadPolicyDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: { title?: string; previousVersionId?: number; file: File }) =>
      organizationApi.uploadPolicyDocument(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.policyDocuments.list() })
    },
  })
}
