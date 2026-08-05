import { useMutation, useQueryClient } from '@tanstack/react-query'
import { trainingKeys } from '../queryKeys'
import type { TrainingRequest } from '../types'
import * as trainingApi from './trainingApi'

export function useCreateTraining() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: TrainingRequest) => trainingApi.createTraining(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.trainings.list() })
    },
  })
}
