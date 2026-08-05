export const auditKeys = {
  logs: {
    all: ['audit', 'logs'] as const,
    list: (params: { entityType?: string; performedBy?: string; from?: string; to?: string; page: number }) =>
      [...auditKeys.logs.all, 'list', params] as const,
  },
}
