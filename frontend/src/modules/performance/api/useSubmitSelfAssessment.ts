import { useMutation } from '@tanstack/react-query'
import type { AssessmentScoreRequest } from '../types'
import * as performanceApi from './performanceApi'

export function useSubmitSelfAssessment() {
  return useMutation({
    mutationFn: ({ employeeId, scores }: { employeeId: number; scores: AssessmentScoreRequest[] }) =>
      performanceApi.submitSelfAssessment(employeeId, scores),
  })
}
