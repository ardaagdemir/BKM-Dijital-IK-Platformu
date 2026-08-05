import { z } from 'zod'

// Backend mesajlarıyla BİREBİR (bkz. StaffingNormService.setNorm).
export const staffingNormSchema = z.object({
  organizationUnitId: z.string().min(1, 'Organizasyon birimi boş olamaz.'),
  jobTitleId: z.string().min(1, 'Unvan boş olamaz.'),
  normCount: z
    .string()
    .min(1, 'Norm kadro sayısı negatif olamaz.')
    .refine((value) => Number(value) >= 0, 'Norm kadro sayısı negatif olamaz.'),
})

export type StaffingNormFormValues = z.infer<typeof staffingNormSchema>

// Backend mesajlarıyla BİREBİR (bkz. CandidateService.apply) — `cv` zorunlu
// dosya alanı, react-hook-form'da `FileList`/`File | undefined` olarak
// tutulur; boş dosya seçilmesi de "boş olamaz" ile aynı mesajı üretir
// (backend'in cvData.length === 0 kontrolüyle AYNI davranış).
export const candidateApplicationSchema = z.object({
  firstName: z.string().min(1, 'Ad boş olamaz.'),
  lastName: z.string().min(1, 'Soyad boş olamaz.'),
  email: z.string().min(1, 'E-posta boş olamaz.').email('Geçerli bir e-posta adresi girin.'),
  appliedPosition: z.string().min(1, 'Başvurulan pozisyon boş olamaz.'),
  cv: z
    .instanceof(File, { message: 'CV dosyası boş olamaz.' })
    .refine((file) => file.size > 0, 'CV dosyası boş olamaz.'),
})

export type CandidateApplicationFormValues = z.infer<typeof candidateApplicationSchema>

// Backend mesajıyla BİREBİR (bkz. CandidateNoteService.addNote).
export const candidateNoteSchema = z.object({
  noteText: z.string().min(1, 'Not metni boş olamaz.'),
})

export type CandidateNoteFormValues = z.infer<typeof candidateNoteSchema>

// Backend mesajlarıyla BİREBİR (bkz. InterviewService.create).
export const interviewSchema = z.object({
  interviewDate: z.string().min(1, 'Mülakat tarihi boş olamaz.'),
  participants: z.string().min(1, 'Katılımcılar boş olamaz.'),
  result: z.string().min(1, 'Sonuç boş olamaz.'),
})

export type InterviewFormValues = z.infer<typeof interviewSchema>

// Backend mesajlarıyla BİREBİR (bkz. HiringRequestService.create).
export const hiringRequestSchema = z.object({
  organizationUnitId: z.string().min(1, 'Organizasyon birimi boş olamaz.'),
  jobTitleId: z.string().min(1, 'Unvan boş olamaz.'),
})

export type HiringRequestFormValues = z.infer<typeof hiringRequestSchema>
