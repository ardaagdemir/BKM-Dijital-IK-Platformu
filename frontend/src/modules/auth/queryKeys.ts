export const authKeys = {
  users: {
    all: ['auth', 'users'] as const,
    list: () => [...authKeys.users.all, 'list'] as const,
  },
}
