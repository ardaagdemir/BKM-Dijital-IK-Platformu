import { z } from 'zod'

// Backend mesajlarıyla BİREBİR (bkz. WarningService.create).
export const warningSchema = z.object({
  date: z.string().min(1, 'Tarih boş olamaz.'),
  reason: z.string().min(1, 'Sebep boş olamaz.'),
  description: z.string().min(1, 'Açıklama boş olamaz.'),
})

export type WarningFormValues = z.infer<typeof warningSchema>

// Backend mesajıyla BİREBİR (bkz. DisciplinaryCaseService.create).
export const disciplinaryCaseSchema = z.object({
  reason: z.string().min(1, 'Gerekçe boş olamaz.'),
})

export type DisciplinaryCaseFormValues = z.infer<typeof disciplinaryCaseSchema>

// Backend mesajıyla BİREBİR (bkz. DisciplinaryCaseService.recordDefense).
export const defenseSchema = z.object({
  defense: z.string().min(1, 'Savunma boş olamaz.'),
})

export type DefenseFormValues = z.infer<typeof defenseSchema>

// Backend mesajlarıyla BİREBİR (bkz. AwardService.create).
export const awardSchema = z.object({
  type: z.string().min(1, 'Ödül türü boş olamaz.'),
  description: z.string().min(1, 'Açıklama boş olamaz.'),
})

export type AwardFormValues = z.infer<typeof awardSchema>
