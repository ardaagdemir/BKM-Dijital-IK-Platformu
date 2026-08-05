export const travelKeys = {
  requests: {
    all: ['travel', 'requests'] as const,
    byEmployee: (employeeId: number) => [...travelKeys.requests.all, employeeId] as const,
  },
  expenseItems: {
    all: ['travel', 'expenseItems'] as const,
    byTravelRequest: (travelRequestId: number) => [...travelKeys.expenseItems.all, travelRequestId] as const,
  },
}
