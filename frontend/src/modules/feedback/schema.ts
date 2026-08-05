import { z } from 'zod'

// Backend mesajlarıyla BİREBİR (bkz. SurveyService.assertValid — dosyanın
// kendisi bulunamadı ama SurveyControllerTest'teki AYNI mesajlar kullanıldı).
const surveyOptionSchema = z.object({
  text: z.string().min(1, 'Seçenek metni boş olamaz.'),
})

export const surveySchema = z.object({
  question: z.string().min(1, 'Soru boş olamaz.'),
  options: z.array(surveyOptionSchema).min(2, 'En az iki seçenek gereklidir.'),
  anonymous: z.boolean(),
})

export type SurveyFormValues = z.infer<typeof surveySchema>

export const surveyAnswerSchema = z.object({
  surveyOptionId: z.string().min(1, 'Bir seçenek seçilmelidir.'),
})

export type SurveyAnswerFormValues = z.infer<typeof surveyAnswerSchema>

// Backend mesajlarıyla BİREBİR (bkz. SuggestionService.create).
export const suggestionSchema = z.object({
  categoryId: z.string().min(1, 'Kategori boş olamaz.'),
  description: z.string().min(1, 'Açıklama boş olamaz.'),
  anonymous: z.boolean(),
})

export type SuggestionFormValues = z.infer<typeof suggestionSchema>

// Backend mesajıyla BİREBİR (bkz. SuggestionCategoryService.assertNotBlank —
// `organization.jobTitleSchema`'daki AYNI desen).
export const suggestionCategorySchema = z.object({
  name: z.string().min(1, 'Kategori adı boş olamaz.'),
})

export type SuggestionCategoryFormValues = z.infer<typeof suggestionCategorySchema>
