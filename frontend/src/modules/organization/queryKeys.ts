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
  },
}
