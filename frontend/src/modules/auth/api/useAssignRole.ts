import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authKeys } from '../queryKeys'
import * as authApi from './authApi'

export function useAssignRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, roleCode }: { userId: number; roleCode: string }) =>
      authApi.assignRole(userId, roleCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.users.all })
    },
  })
}
