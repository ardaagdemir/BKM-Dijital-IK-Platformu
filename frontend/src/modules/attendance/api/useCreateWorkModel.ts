import { useMutation, useQueryClient } from '@tanstack/react-query'
import { attendanceKeys } from '../queryKeys'
import type { WorkModelRequest } from '../types'
import * as attendanceApi from './attendanceApi'

export function useCreateWorkModel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: WorkModelRequest) => attendanceApi.createWorkModel(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.workModels.list() })
    },
  })
}
