import { useQuery } from '@tanstack/react-query'
import { travelKeys } from '../queryKeys'
import * as travelApi from './travelApi'

export function useExpenseItems(travelRequestId: number | undefined) {
  return useQuery({
    queryKey: travelKeys.expenseItems.byTravelRequest(travelRequestId ?? 0),
    queryFn: () => travelApi.listExpenseItems(travelRequestId ?? 0),
    enabled: !!travelRequestId,
  })
}
