import { useMutation, useQueryClient } from '@tanstack/react-query'
import { travelKeys } from '../queryKeys'
import type { ExpenseItemDecisionRequest } from '../types'
import * as travelApi from './travelApi'

export function useDecideExpenseItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      travelRequestId,
      id,
      request,
    }: {
      travelRequestId: number
      id: number
      request: ExpenseItemDecisionRequest
    }) => travelApi.decideExpenseItem(travelRequestId, id, request),
    onSuccess: (decided) => {
      queryClient.invalidateQueries({ queryKey: travelKeys.expenseItems.byTravelRequest(decided.travelRequestId) })
    },
  })
}
