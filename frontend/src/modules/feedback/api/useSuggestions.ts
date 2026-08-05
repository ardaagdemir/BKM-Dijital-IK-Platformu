import { useQuery } from '@tanstack/react-query'
import { feedbackKeys } from '../queryKeys'
import * as feedbackApi from './feedbackApi'

export function useSuggestions(employeeId?: number) {
  return useQuery({
    queryKey: feedbackKeys.suggestions.list(employeeId),
    queryFn: () => feedbackApi.listSuggestions(employeeId),
  })
}
