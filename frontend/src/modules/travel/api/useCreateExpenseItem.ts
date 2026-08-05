import { useMutation, useQueryClient } from '@tanstack/react-query'
import { travelKeys } from '../queryKeys'
import * as travelApi from './travelApi'

export function useCreateExpenseItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: { travelRequestId: number; amount: string; document: File }) =>
      travelApi.createExpenseItem(params),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: travelKeys.expenseItems.byTravelRequest(created.travelRequestId) })
    },
  })
}
