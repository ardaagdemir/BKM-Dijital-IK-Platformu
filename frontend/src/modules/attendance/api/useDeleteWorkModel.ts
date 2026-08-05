import { useMutation, useQueryClient } from '@tanstack/react-query'
import { attendanceKeys } from '../queryKeys'
import * as attendanceApi from './attendanceApi'

export function useDeleteWorkModel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => attendanceApi.deleteWorkModel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.workModels.list() })
    },
  })
}
