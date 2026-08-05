import { useMutation, useQueryClient } from '@tanstack/react-query'
import { trainingKeys } from '../queryKeys'
import * as trainingApi from './trainingApi'

export function useCompleteEnrollment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, completedDate }: { id: number; completedDate: string }) =>
      trainingApi.completeEnrollment(id, completedDate),
    onSuccess: (completed) => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.enrollments.byEmployee(completed.employeeId) })
      queryClient.invalidateQueries({ queryKey: trainingKeys.completed.all })
    },
  })
}
