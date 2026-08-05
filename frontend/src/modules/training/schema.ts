import { z } from 'zod'

// Backend mesajlarıyla BİREBİR (bkz. TrainingService.assertValid).
export const trainingSchema = z.object({
  name: z.string().min(1, 'Eğitim adı boş olamaz.'),
  type: z.string().min(1, 'Eğitim türü boş olamaz.'),
  durationHours: z
    .string()
    .min(1, 'Süre (saat) sıfırdan büyük olmalıdır.')
    .refine((value) => Number(value) > 0, 'Süre (saat) sıfırdan büyük olmalıdır.'),
  provider: z.string().min(1, 'Sağlayıcı boş olamaz.'),
})

export type TrainingFormValues = z.infer<typeof trainingSchema>

// Backend mesajıyla BİREBİR (bkz. ApprovalDecisionValidator.validate).
export const rejectionReasonSchema = z.object({
  rejectionReason: z.string().min(1, 'Ret gerekçesi zorunludur.'),
})

export type RejectionReasonFormValues = z.infer<typeof rejectionReasonSchema>

// Backend mesajıyla BİREBİR (bkz. TrainingEnrollmentService.complete).
export const completeEnrollmentSchema = z.object({
  completedDate: z.string().min(1, 'Tamamlanma tarihi boş olamaz.'),
})

export type CompleteEnrollmentFormValues = z.infer<typeof completeEnrollmentSchema>
