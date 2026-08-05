import { useMutation, useQueryClient } from '@tanstack/react-query'
import { trainingKeys } from '../queryKeys'
import type { TrainingRequest } from '../types'
import * as trainingApi from './trainingApi'

export function useUpdateTraining() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: TrainingRequest }) => trainingApi.updateTraining(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.trainings.list() })
    },
  })
}
