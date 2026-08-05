import { useQuery } from '@tanstack/react-query'
import { organizationKeys } from '../queryKeys'
import * as organizationApi from './organizationApi'

// GET 404 döner ("Özlük bilgisi bulunamadı.") profil hiç kaydedilmemişse —
// bu BEKLENEN bir durum (ilk kez doldurulacak), gereksiz retry YAPILMAZ.
export function useEmployeeProfile(id: number) {
  return useQuery({
    queryKey: organizationKeys.employees.profile(id),
    queryFn: () => organizationApi.getEmployeeProfile(id),
    enabled: Number.isFinite(id),
    retry: false,
  })
}
