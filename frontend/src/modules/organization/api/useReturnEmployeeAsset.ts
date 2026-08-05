import { useMutation, useQueryClient } from '@tanstack/react-query'
import { organizationKeys } from '../queryKeys'
import type { ReturnEmployeeAssetRequest } from '../types'
import * as organizationApi from './organizationApi'

export function useReturnEmployeeAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      employeeId,
      assetId,
      request,
    }: {
      employeeId: number
      assetId: number
      request: ReturnEmployeeAssetRequest
    }) => organizationApi.returnEmployeeAsset(employeeId, assetId, request),
    onSuccess: (_asset, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.employees.assets(employeeId) })
    },
  })
}
