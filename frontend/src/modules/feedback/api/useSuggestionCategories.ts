import { useQuery } from '@tanstack/react-query'
import { feedbackKeys } from '../queryKeys'
import * as feedbackApi from './feedbackApi'

export function useSuggestionCategories() {
  return useQuery({
    queryKey: feedbackKeys.suggestionCategories.list(),
    queryFn: feedbackApi.listSuggestionCategories,
  })
}
