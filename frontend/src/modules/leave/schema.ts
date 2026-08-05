import { z } from 'zod'

// Bölüm 8: backend mesajlarıyla BİREBİR aynı Türkçe metin (bkz.
// leave.LeaveTypeService.assertValid).
export const leaveTypeSchema = z.object({
  name: z.string().min(1, 'İzin türü adı boş olamaz.'),
  code: z.string().min(1, 'İzin türü kodu boş olamaz.'),
})

export type LeaveTypeFormValues = z.infer<typeof leaveTypeSchema>

// Backend mesajlarıyla BİREBİR aynı (bkz. leave.LeaveRequestService.create).
export const createLeaveRequestSchema = z
  .object({
    leaveTypeId: z.string().min(1, 'İzin türü boş olamaz.'),
    startDate: z.string().min(1, 'Tarih aralığı boş olamaz.'),
    endDate: z.string().min(1, 'Tarih aralığı boş olamaz.'),
  })
  .refine((values) => !values.startDate || !values.endDate || values.endDate >= values.startDate, {
    message: 'Bitiş tarihi başlangıç tarihinden önce olamaz.',
    path: ['endDate'],
  })

export type CreateLeaveRequestFormValues = z.infer<typeof createLeaveRequestSchema>

// Backend'in ApprovalDecisionValidator'ıyla BİREBİR AYNI mesaj — yalnızca
// RET akışında kullanılır (onayda gerekçe istenmez).
export const rejectionReasonSchema = z.object({
  rejectionReason: z.string().min(1, 'Ret gerekçesi zorunludur.'),
})

export type RejectionReasonFormValues = z.infer<typeof rejectionReasonSchema>
