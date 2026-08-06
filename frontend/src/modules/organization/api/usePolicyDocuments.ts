import { useQuery } from '@tanstack/react-query'
import { organizationKeys } from '../queryKeys'
import * as organizationApi from './organizationApi'

export function usePolicyDocuments() {
  return useQuery({ queryKey: organizationKeys.policyDocuments.list(), queryFn: organizationApi.listPolicyDocuments })
}
