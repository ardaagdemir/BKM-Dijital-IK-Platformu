import { useQuery } from '@tanstack/react-query'
import { organizationKeys } from '../queryKeys'
import * as organizationApi from './organizationApi'

export function useOrganizationChart() {
  return useQuery({ queryKey: organizationKeys.chart.all, queryFn: organizationApi.getOrganizationChart })
}
