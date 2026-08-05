import { useQuery } from '@tanstack/react-query'
import { attendanceKeys } from '../queryKeys'
import * as attendanceApi from './attendanceApi'

export function useWorkModels() {
  return useQuery({ queryKey: attendanceKeys.workModels.list(), queryFn: attendanceApi.listWorkModels })
}
