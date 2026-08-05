import { useQuery } from '@tanstack/react-query'
import { organizationKeys } from '../queryKeys'
import * as organizationApi from './organizationApi'

// 404 (çalışan kaydı yok) BEKLENEN bir durumdur (ör. yalnızca ADMIN
// hesabı) — gereksiz retry YAPILMAZ (bkz. useEmployeeProfile'daki AYNI
// gerekçe).
export function useMyEmployee() {
  return useQuery({
    queryKey: organizationKeys.employees.me(),
    queryFn: organizationApi.getMyEmployee,
    retry: false,
  })
}
