import { useMutation } from '@tanstack/react-query'
import * as recruitmentApi from './recruitmentApi'

// `/careers/apply` kimlik doğrulaması gerektirmez — sorgu invalidasyonuna
// gerek yok (giriş yapmış bir kullanıcı bağlamı yok, gösterilecek liste
// yok — yalnızca başarı/hata durumu formda ele alınır).
export function useApplyAsCandidate() {
  return useMutation({
    mutationFn: recruitmentApi.applyAsCandidate,
  })
}
