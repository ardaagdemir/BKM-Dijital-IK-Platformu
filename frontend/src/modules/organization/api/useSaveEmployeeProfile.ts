import { useMutation, useQueryClient } from '@tanstack/react-query'
import { organizationKeys } from '../queryKeys'
import type { EmployeeProfileRequest } from '../types'
import * as organizationApi from './organizationApi'

export function useSaveEmployeeProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: EmployeeProfileRequest }) =>
      organizationApi.saveEmployeeProfile(id, request),
    onSuccess: (profile) => {
      queryClient.setQueryData(organizationKeys.employees.profile(profile.employeeId), profile)
    },
  })
}
