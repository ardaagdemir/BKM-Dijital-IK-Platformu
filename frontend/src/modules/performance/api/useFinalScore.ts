import { useQuery } from '@tanstack/react-query'
import { performanceKeys } from '../queryKeys'
import * as performanceApi from './performanceApi'

// Bir değerlendirmede hiç puan yoksa backend 400 döner (bkz.
// FinalScoreService.calculate) — bu satır İÇİN retry anlamsız, ama liste
// sayfasında zaten `ManagerAssessmentSummaryResponse.finalScore` (null
// olabilir) kullanılıyor; bu hook yalnızca DETAY görünümü için (bkz.
// PerformanceResultsPage).
export function useFinalScore(managerAssessmentId: number | undefined) {
  return useQuery({
    queryKey: performanceKeys.finalScore.detail(managerAssessmentId ?? 0),
    queryFn: () => performanceApi.getFinalScore(managerAssessmentId ?? 0),
    enabled: !!managerAssessmentId,
    retry: false,
  })
}
