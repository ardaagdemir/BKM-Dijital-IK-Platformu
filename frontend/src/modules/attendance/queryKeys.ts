export const attendanceKeys = {
  workModels: {
    all: ['attendance', 'workModels'] as const,
    list: () => [...attendanceKeys.workModels.all, 'list'] as const,
  },
  workModelAssignment: {
    all: ['attendance', 'workModelAssignment'] as const,
    byEmployee: (employeeId: number) => [...attendanceKeys.workModelAssignment.all, employeeId] as const,
  },
  records: {
    all: ['attendance', 'records'] as const,
    byEmployee: (employeeId: number) => [...attendanceKeys.records.all, employeeId] as const,
  },
  deviations: {
    all: ['attendance', 'deviations'] as const,
    byEmployee: (employeeId: number) => [...attendanceKeys.deviations.all, employeeId] as const,
  },
  timesheet: {
    all: ['attendance', 'timesheet'] as const,
    detail: (employeeId: number, year: number, month: number) =>
      [...attendanceKeys.timesheet.all, employeeId, year, month] as const,
  },
}
