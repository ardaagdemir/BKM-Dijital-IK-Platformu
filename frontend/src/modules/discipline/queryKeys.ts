export const disciplineKeys = {
  warnings: {
    all: ['discipline', 'warnings'] as const,
    byEmployee: (employeeId: number) => [...disciplineKeys.warnings.all, employeeId] as const,
  },
  cases: {
    all: ['discipline', 'cases'] as const,
    byEmployee: (employeeId: number) => [...disciplineKeys.cases.all, employeeId] as const,
    revisions: (id: number) => [...disciplineKeys.cases.all, 'revisions', id] as const,
  },
  awards: {
    all: ['discipline', 'awards'] as const,
    byEmployee: (employeeId: number) => [...disciplineKeys.awards.all, employeeId] as const,
  },
}
