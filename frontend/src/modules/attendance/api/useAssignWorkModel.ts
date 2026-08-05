import { useMutation, useQueryClient } from '@tanstack/react-query'
import { attendanceKeys } from '../queryKeys'
import * as attendanceApi from './attendanceApi'

export function useAssignWorkModel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ employeeId, workModelId }: { employeeId: number; workModelId: number }) =>
      attendanceApi.assignWorkModel(employeeId, workModelId),
    onSuccess: (assignment) => {
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.workModelAssignment.byEmployee(assignment.employeeId),
      })
    },
  })
}
