export const recruitmentKeys = {
  staffingNorms: {
    all: ['recruitment', 'staffingNorms'] as const,
    list: () => [...recruitmentKeys.staffingNorms.all, 'list'] as const,
  },
  candidates: {
    all: ['recruitment', 'candidates'] as const,
    list: () => [...recruitmentKeys.candidates.all, 'list'] as const,
    detail: (id: number) => [...recruitmentKeys.candidates.all, id] as const,
    notes: (candidateId: number) => [...recruitmentKeys.candidates.all, candidateId, 'notes'] as const,
    interviews: (candidateId: number) => [...recruitmentKeys.candidates.all, candidateId, 'interviews'] as const,
  },
  hiringRequests: {
    all: ['recruitment', 'hiringRequests'] as const,
    list: (organizationUnitId?: number) =>
      [...recruitmentKeys.hiringRequests.all, 'list', organizationUnitId ?? 'all'] as const,
  },
}
