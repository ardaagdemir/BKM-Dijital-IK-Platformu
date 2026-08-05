import { useQuery } from '@tanstack/react-query'
import { trainingKeys } from '../queryKeys'
import * as trainingApi from './trainingApi'

export function useTrainings() {
  return useQuery({ queryKey: trainingKeys.trainings.list(), queryFn: trainingApi.listTrainings })
}
