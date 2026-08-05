import { z } from 'zod'

// Backend mesajlarıyla BİREBİR (bkz. WorkModelService.assertValid). Saat
// alanları HTML `type="time"` input'undan "HH:mm" formatında gelir —
// Jackson'ın varsayılan `LocalTime` ayrıştırıcısı (ISO_LOCAL_TIME) bunu
// SORUNSUZ kabul eder, ayrıca ":00" saniye eklemeye GEREK YOK.
export const workModelSchema = z
  .object({
    name: z.string().min(1, 'Çalışma modeli adı boş olamaz.'),
    plannedStartTime: z.string().min(1, 'Planlanan başlangıç/bitiş saati boş olamaz.'),
    plannedEndTime: z.string().min(1, 'Planlanan başlangıç/bitiş saati boş olamaz.'),
  })
  .refine((values) => values.plannedEndTime > values.plannedStartTime, {
    message: 'Planlanan bitiş saati, başlangıç saatinden sonra olmalıdır.',
    path: ['plannedEndTime'],
  })

export type WorkModelFormValues = z.infer<typeof workModelSchema>

// Backend mesajıyla BİREBİR (bkz. WorkModelAssignmentService.assign).
export const workModelAssignmentSchema = z.object({
  workModelId: z.string().min(1, 'Çalışma modeli boş olamaz.'),
})

export type WorkModelAssignmentFormValues = z.infer<typeof workModelAssignmentSchema>
