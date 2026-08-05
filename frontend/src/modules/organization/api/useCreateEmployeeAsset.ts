import { useMutation, useQueryClient } from '@tanstack/react-query'
import { organizationKeys } from '../queryKeys'
import type { CreateEmployeeAssetRequest } from '../types'
import * as organizationApi from './organizationApi'

export function useCreateEmployeeAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ employeeId, request }: { employeeId: number; request: CreateEmployeeAssetRequest }) =>
      organizationApi.createEmployeeAsset(employeeId, request),
    onSuccess: (_asset, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.employees.assets(employeeId) })
    },
  })
}
