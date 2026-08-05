import { z } from 'zod'

// Backend mesajlarıyla BİREBİR (bkz. TravelRequestService.create).
export const travelRequestSchema = z
  .object({
    location: z.string().min(1, 'Lokasyon boş olamaz.'),
    startDate: z.string().min(1, 'Tarih aralığı boş olamaz.'),
    endDate: z.string().min(1, 'Tarih aralığı boş olamaz.'),
    purpose: z.string().min(1, 'Amaç boş olamaz.'),
  })
  .refine((values) => values.endDate >= values.startDate, {
    message: 'Bitiş tarihi başlangıç tarihinden önce olamaz.',
    path: ['endDate'],
  })

export type TravelRequestFormValues = z.infer<typeof travelRequestSchema>

// Backend mesajlarıyla BİREBİR (bkz. ExpenseItemService.create) — `document`
// zorunlu dosya alanı, `recruitment.schema.candidateApplicationSchema`'daki
// AYNI desen (bkz. o dosyadaki not).
export const expenseItemSchema = z.object({
  amount: z
    .string()
    .min(1, 'Tutar sıfırdan büyük olmalıdır.')
    .refine((value) => Number(value) > 0, 'Tutar sıfırdan büyük olmalıdır.'),
  document: z
    .instanceof(File, { message: 'Belge boş olamaz.' })
    .refine((file) => file.size > 0, 'Belge boş olamaz.'),
})

export type ExpenseItemFormValues = z.infer<typeof expenseItemSchema>

// Backend mesajıyla BİREBİR (bkz. ApprovalDecisionValidator.validate).
export const expenseRejectionReasonSchema = z.object({
  rejectionReason: z.string().min(1, 'Ret gerekçesi zorunludur.'),
})

export type ExpenseRejectionReasonFormValues = z.infer<typeof expenseRejectionReasonSchema>
