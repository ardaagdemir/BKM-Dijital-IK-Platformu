// Bölüm 7: "queryKey fabrikaları modül bazında tanımlanır, çakışma önlenir."
export const organizationKeys = {
  units: {
    all: ['organization', 'units'] as const,
    list: () => [...organizationKeys.units.all, 'list'] as const,
  },
  jobTitles: {
    all: ['organization', 'jobTitles'] as const,
    list: () => [...organizationKeys.jobTitles.all, 'list'] as const,
  },
  employees: {
    all: ['organization', 'employees'] as const,
    detail: (id: number) => [...organizationKeys.employees.all, 'detail', id] as const,
    list: (params: { name?: string; organizationUnitId?: number; jobTitleId?: number; page: number }) =>
      [...organizationKeys.employees.all, 'list', params] as const,
    profile: (id: number) => [...organizationKeys.employees.all, 'profile', id] as const,
    assets: (id: number) => [...organizationKeys.employees.all, 'assets', id] as const,
    assignmentHistory: (id: number) => [...organizationKeys.employees.all, 'assignmentHistory', id] as const,
    me: () => [...organizationKeys.employees.all, 'me'] as const,
  },
  policyDocuments: {
    all: ['organization', 'policyDocuments'] as const,
    list: () => [...organizationKeys.policyDocuments.all, 'list'] as const,
  },
  jobDescriptions: {
    all: ['organization', 'jobDescriptions'] as const,
    byJobTitle: (jobTitleId: number) => [...organizationKeys.jobDescriptions.all, jobTitleId] as const,
  },
  chart: {
    all: ['organization', 'chart'] as const,
  },
}
