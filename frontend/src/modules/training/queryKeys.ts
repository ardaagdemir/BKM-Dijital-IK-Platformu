export const trainingKeys = {
  trainings: {
    all: ['training', 'trainings'] as const,
    list: () => [...trainingKeys.trainings.all, 'list'] as const,
  },
  enrollments: {
    all: ['training', 'enrollments'] as const,
    byEmployee: (employeeId: number) => [...trainingKeys.enrollments.all, employeeId] as const,
  },
  completed: {
    all: ['training', 'completed'] as const,
    list: (employeeId?: number) => [...trainingKeys.completed.all, employeeId ?? 'all'] as const,
  },
}
