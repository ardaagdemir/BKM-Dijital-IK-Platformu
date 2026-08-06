import { z } from 'zod'

// Backend mesajıyla BİREBİR (bkz. ClubService.assertNotBlank). `leaderId`
// RHF'e KAYDEDİLMEZ — `EmployeeAutocomplete` bir `Employee` nesnesi
// bekler, ayrı bileşen state'i olarak yönetilir (`discipline.WarningsPage`'deki
// AYNI "employee RHF dışında" deseni).
export const clubSchema = z.object({
  name: z.string().min(1, 'Kulüp adı boş olamaz.'),
})

export type ClubFormValues = z.infer<typeof clubSchema>

// Backend mesajlarıyla BİREBİR (bkz. ClubEventService.create).
export const clubEventSchema = z.object({
  name: z.string().min(1, 'Etkinlik adı boş olamaz.'),
  date: z.string().min(1, 'Tarih boş olamaz.'),
})

export type ClubEventFormValues = z.infer<typeof clubEventSchema>

// Backend mesajıyla BİREBİR (bkz. `organization.jobTitleSchema`'daki AYNI desen).
export const serviceOfferingSchema = z.object({
  name: z.string().min(1, 'Hizmet adı boş olamaz.'),
})

export type ServiceOfferingFormValues = z.infer<typeof serviceOfferingSchema>

// Backend mesajlarıyla BİREBİR (bkz. AppointmentSlotService.create).
// `serviceOfferingId` BURADA YOK — sayfa önce bir hizmet seçtirir (bkz.
// `ServiceOfferingsPage`'in KENDİ dosyasındaki not), dialog yalnızca
// zaman aralığını sorar (`discipline.WarningsPage`'deki "employee dialog
// dışında" AYNI karar).
export const appointmentSlotSchema = z
  .object({
    startTime: z.string().min(1, 'Başlangıç ve bitiş zamanı boş olamaz.'),
    endTime: z.string().min(1, 'Başlangıç ve bitiş zamanı boş olamaz.'),
  })
  .refine((values) => !values.startTime || !values.endTime || values.startTime < values.endTime, {
    message: 'Başlangıç zamanı bitiş zamanından önce olmalıdır.',
    path: ['endTime'],
  })

export type AppointmentSlotFormValues = z.infer<typeof appointmentSlotSchema>

export const appointmentBookingSchema = z.object({
  slotId: z.string().min(1, 'Bir slot seçilmelidir.'),
})

export type AppointmentBookingFormValues = z.infer<typeof appointmentBookingSchema>

export const appointmentNoteSchema = z.object({
  note: z.string(),
})

export type AppointmentNoteFormValues = z.infer<typeof appointmentNoteSchema>
