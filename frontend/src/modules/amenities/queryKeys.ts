export const amenitiesKeys = {
  clubs: {
    all: ['amenities', 'clubs'] as const,
    list: () => [...amenitiesKeys.clubs.all, 'list'] as const,
  },
  clubEvents: {
    all: ['amenities', 'clubEvents'] as const,
    byClub: (clubId: number) => [...amenitiesKeys.clubEvents.all, clubId] as const,
  },
  membershipRequests: {
    all: ['amenities', 'membershipRequests'] as const,
    list: (employeeId?: number) => [...amenitiesKeys.membershipRequests.all, employeeId ?? 'all'] as const,
  },
  services: {
    all: ['amenities', 'services'] as const,
    list: () => [...amenitiesKeys.services.all, 'list'] as const,
  },
  slots: {
    all: ['amenities', 'slots'] as const,
    byService: (serviceOfferingId: number) => [...amenitiesKeys.slots.all, serviceOfferingId] as const,
  },
  appointments: {
    all: ['amenities', 'appointments'] as const,
    byEmployee: (employeeId: number) => [...amenitiesKeys.appointments.all, employeeId] as const,
  },
  appointmentNote: {
    all: ['amenities', 'appointmentNote'] as const,
    byAppointment: (appointmentId: number) => [...amenitiesKeys.appointmentNote.all, appointmentId] as const,
  },
}
