import { useMutation, useQueryClient } from '@tanstack/react-query'
import { trainingKeys } from '../queryKeys'
import * as trainingApi from './trainingApi'

export function useDeleteTraining() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => trainingApi.deleteTraining(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.trainings.list() })
    },
  })
}
