import { useMutation, useQueryClient } from '@tanstack/react-query'
import { trainingKeys } from '../queryKeys'
import type { CreateTrainingEnrollmentRequest } from '../types'
import * as trainingApi from './trainingApi'

export function useCreateEnrollment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateTrainingEnrollmentRequest) => trainingApi.createEnrollment(request),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.enrollments.byEmployee(created.employeeId) })
    },
  })
}
