import { useMutation, useQueryClient } from '@tanstack/react-query'
import { organizationKeys } from '../queryKeys'
import * as organizationApi from './organizationApi'

export function useCreateUnit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: organizationApi.createUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.units.list() })
    },
  })
}
