import { useMutation, useQueryClient } from '@tanstack/react-query'
import { performanceKeys } from '../queryKeys'
import type { AssessmentScoreRequest } from '../types'
import * as performanceApi from './performanceApi'

export function useSubmitManagerAssessment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      employeeId,
      period,
      scores,
      teamEmployeeIds,
    }: {
      employeeId: number
      period: string
      scores: AssessmentScoreRequest[]
      teamEmployeeIds?: number[]
    }) => performanceApi.submitManagerAssessment(employeeId, period, scores, teamEmployeeIds),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.managerAssessments.byEmployee(created.employeeId) })
    },
  })
}
