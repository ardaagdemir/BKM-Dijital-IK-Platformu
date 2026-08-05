import { useQuery } from '@tanstack/react-query'
import { performanceKeys } from '../queryKeys'
import * as performanceApi from './performanceApi'

// 404 (puanlama skalası HENÜZ tanımlanmamış — bkz. RatingScaleService.getScale)
// BEKLENEN bir durumdur, gereksiz retry YAPILMAZ (bkz. useMyEmployee'daki AYNI gerekçe).
export function useSelfAssessmentForm() {
  return useQuery({
    queryKey: performanceKeys.selfAssessmentForm.all,
    queryFn: performanceApi.getSelfAssessmentForm,
    retry: false,
  })
}
