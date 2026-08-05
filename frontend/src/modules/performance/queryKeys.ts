export const performanceKeys = {
  goals: { all: ['performance', 'goals'] as const, list: () => [...performanceKeys.goals.all, 'list'] as const },
  competencies: {
    all: ['performance', 'competencies'] as const,
    list: () => [...performanceKeys.competencies.all, 'list'] as const,
  },
  ratingScale: { all: ['performance', 'ratingScale'] as const },
  weightConfig: { all: ['performance', 'weightConfig'] as const },
  selfAssessmentForm: { all: ['performance', 'selfAssessmentForm'] as const },
  managerAssessments: {
    all: ['performance', 'managerAssessments'] as const,
    byEmployee: (employeeId: number) => [...performanceKeys.managerAssessments.all, employeeId] as const,
  },
  finalScore: {
    all: ['performance', 'finalScore'] as const,
    detail: (managerAssessmentId: number) => [...performanceKeys.finalScore.all, managerAssessmentId] as const,
  },
}
