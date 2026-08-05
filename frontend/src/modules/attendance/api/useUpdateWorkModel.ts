import { useMutation, useQueryClient } from '@tanstack/react-query'
import { attendanceKeys } from '../queryKeys'
import type { WorkModelRequest } from '../types'
import * as attendanceApi from './attendanceApi'

export function useUpdateWorkModel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: WorkModelRequest }) =>
      attendanceApi.updateWorkModel(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.workModels.list() })
    },
  })
}
