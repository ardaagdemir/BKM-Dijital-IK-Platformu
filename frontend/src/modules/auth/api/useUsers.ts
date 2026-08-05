import { useQuery } from '@tanstack/react-query'
import { authKeys } from '../queryKeys'
import * as authApi from './authApi'

export function useUsers() {
  return useQuery({
    queryKey: authKeys.users.list(),
    queryFn: authApi.listUsers,
  })
}
