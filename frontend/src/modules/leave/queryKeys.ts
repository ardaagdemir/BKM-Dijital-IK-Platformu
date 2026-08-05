export const leaveKeys = {
  types: {
    all: ['leave', 'types'] as const,
    list: () => [...leaveKeys.types.all, 'list'] as const,
  },
  balance: {
    all: ['leave', 'balance'] as const,
    detail: (employeeId: number) => [...leaveKeys.balance.all, employeeId] as const,
  },
  requests: {
    all: ['leave', 'requests'] as const,
    byEmployee: (employeeId: number) => [...leaveKeys.requests.all, 'byEmployee', employeeId] as const,
  },
}
