import { z } from 'zod'

// Backend mesajlarıyla BİREBİR (bkz. GoalService.assertValid) — ağırlık
// toplamı 100'ü aşma kontrolü backend'de yapılır (bkz. `assertTotalWeightNotExceeded`,
// mevcut toplama bağlı olduğundan istemcide TEKRAR EDİLMEZ); form yalnızca
// tekil alan sınırlarını (1-100) doğrular, backend'in 400 mesajı submit
// hatası olarak gösterilir.
export const goalSchema = z.object({
  name: z.string().min(1, 'Hedef adı boş olamaz.'),
  weight: z
    .string()
    .min(1, 'Ağırlık 1 ile 100 arasında olmalıdır.')
    .refine((value) => Number(value) >= 1 && Number(value) <= 100, 'Ağırlık 1 ile 100 arasında olmalıdır.'),
})

export type GoalFormValues = z.infer<typeof goalSchema>

// Backend mesajlarıyla BİREBİR (bkz. CompetencyService.assertValid).
export const competencySchema = z.object({
  name: z.string().min(1, 'Yetkinlik adı boş olamaz.'),
  weight: z
    .string()
    .min(1, 'Ağırlık 1 ile 100 arasında olmalıdır.')
    .refine((value) => Number(value) >= 1 && Number(value) <= 100, 'Ağırlık 1 ile 100 arasında olmalıdır.'),
})

export type CompetencyFormValues = z.infer<typeof competencySchema>

// Backend mesajlarıyla BİREBİR (bkz. RatingScaleService.setScale) —
// "Üst sınır, alt sınırdan büyük olmalıdır." toplam formda `.refine` ile.
export const ratingScaleSchema = z
  .object({
    minValue: z.string().min(1, 'Alt ve üst sınır boş olamaz.'),
    maxValue: z.string().min(1, 'Alt ve üst sınır boş olamaz.'),
  })
  .refine((values) => Number(values.minValue) >= 1, {
    message: "Alt sınır 1'den küçük olamaz.",
    path: ['minValue'],
  })
  .refine((values) => Number(values.maxValue) > Number(values.minValue), {
    message: 'Üst sınır, alt sınırdan büyük olmalıdır.',
    path: ['maxValue'],
  })

export type RatingScaleFormValues = z.infer<typeof ratingScaleSchema>

// Backend mesajlarıyla BİREBİR (bkz. AssessmentWeightConfigService.setConfig).
export const assessmentWeightConfigSchema = z
  .object({
    goalWeight: z.string().min(1, 'Hedef ve yetkinlik ağırlıkları boş olamaz.'),
    competencyWeight: z.string().min(1, 'Hedef ve yetkinlik ağırlıkları boş olamaz.'),
  })
  .refine((values) => Number(values.goalWeight) + Number(values.competencyWeight) === 100, {
    message: 'Hedef ve yetkinlik ağırlıklarının toplamı 100 olmalıdır.',
    path: ['competencyWeight'],
  })

export type AssessmentWeightConfigFormValues = z.infer<typeof assessmentWeightConfigSchema>

// Backend mesajıyla BİREBİR (bkz. ManagerAssessmentService.submit) —
// yalnızca `team-assessments` formunda kullanılır (öz değerlendirmede dönem
// alanı yok).
export const periodSchema = z.string().min(1, 'Dönem boş olamaz.')
