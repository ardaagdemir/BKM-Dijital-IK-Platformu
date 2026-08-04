import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { organizationKeys } from '../queryKeys'
import type { EmployeeSearchParams } from '../types'
import * as organizationApi from './organizationApi'

// Bölüm 13.6: "filtre değişince mevcut veri SOLUK gösterilirken arka
// planda yenilenir (keepPreviousData, ani boşluk/yanıp sönme olmasın diye)."
export function useEmployees(params: EmployeeSearchParams & { page: number }) {
  return useQuery({
    queryKey: organizationKeys.employees.list(params),
    queryFn: () => organizationApi.searchEmployees(params),
    placeholderData: keepPreviousData,
  })
}
