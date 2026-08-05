import { HttpResponse, http } from 'msw'
import type {
  Suggestion,
  SuggestionCategory,
  Survey,
  SurveyAnswer,
} from '../../../src/modules/feedback/types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

function notFound(title: string, detail: string) {
  return HttpResponse.json({ type: 'about:blank', title, status: 404, detail }, { status: 404 })
}

function badRequest(detail: string) {
  return HttpResponse.json({ type: 'about:blank', title: 'Geçersiz istek', status: 400, detail }, { status: 400 })
}

// `training.ts`/`discipline.ts`'teki AYNI fabrika deseni.
export function createFeedbackHandlers(
  initialSurveys: Survey[] = [],
  initialCategories: SuggestionCategory[] = [],
  initialSuggestions: Suggestion[] = [],
) {
  const surveys = [...initialSurveys]
  const answers: SurveyAnswer[] = []
  const categories = [...initialCategories]
  const suggestions = [...initialSuggestions]

  let nextSurveyId = surveys.reduce((max, s) => Math.max(max, s.id), 0) + 1
  let nextOptionId = surveys.reduce((max, s) => Math.max(max, ...s.options.map((o) => o.id), 0), 0) + 1
  let nextAnswerId = 1
  let nextCategoryId = categories.reduce((max, c) => Math.max(max, c.id), 0) + 1
  let nextSuggestionId = suggestions.reduce((max, s) => Math.max(max, s.id), 0) + 1

  return [
    http.get(`${BASE_URL}/api/surveys`, () => HttpResponse.json(surveys)),
    http.post(`${BASE_URL}/api/surveys`, async ({ request }) => {
      const body = (await request.json()) as { question: string; options: string[]; anonymous: boolean }
      if (!body.question || !body.question.trim()) {
        return badRequest('Soru boş olamaz.')
      }
      if (!body.options || body.options.length < 2) {
        return badRequest('En az iki seçenek gereklidir.')
      }
      if (body.options.some((text) => !text || !text.trim())) {
        return badRequest('Seçenek metni boş olamaz.')
      }
      const created: Survey = {
        id: nextSurveyId++,
        question: body.question,
        anonymous: body.anonymous,
        options: body.options.map((text) => ({ id: nextOptionId++, text })),
      }
      surveys.push(created)
      return HttpResponse.json(created, { status: 201 })
    }),

    http.post(`${BASE_URL}/api/surveys/:surveyId/answers`, async ({ request, params }) => {
      const surveyId = Number(params.surveyId)
      const survey = surveys.find((s) => s.id === surveyId)
      if (!survey) {
        return notFound('Anket bulunamadı', 'Anket bulunamadı.')
      }
      const body = (await request.json()) as { surveyOptionId: number; employeeId: number | null }
      const option = survey.options.find((o) => o.id === body.surveyOptionId)
      if (!option) {
        return notFound('Seçenek bulunamadı', 'Seçenek bulunamadı.')
      }
      const created: SurveyAnswer = {
        id: nextAnswerId++,
        surveyId,
        surveyOptionId: body.surveyOptionId,
        employeeId: survey.anonymous ? null : body.employeeId,
      }
      answers.push(created)
      return HttpResponse.json(created, { status: 201 })
    }),

    http.get(`${BASE_URL}/api/surveys/:id/results`, ({ params }) => {
      const id = Number(params.id)
      const survey = surveys.find((s) => s.id === id)
      if (!survey) {
        return notFound('Anket bulunamadı', 'Anket bulunamadı.')
      }
      const surveyAnswers = answers.filter((a) => a.surveyId === id)
      const totalResponses = surveyAnswers.length
      const options = survey.options.map((option) => {
        const voteCount = surveyAnswers.filter((a) => a.surveyOptionId === option.id).length
        const percentage = totalResponses === 0 ? 0 : Math.round((voteCount * 1000) / totalResponses) / 10
        return { optionId: option.id, text: option.text, voteCount, percentage }
      })
      return HttpResponse.json({ surveyId: id, question: survey.question, totalResponses, options })
    }),

    http.get(`${BASE_URL}/api/suggestions/categories`, () => HttpResponse.json(categories)),
    http.post(`${BASE_URL}/api/suggestions/categories`, async ({ request }) => {
      const body = (await request.json()) as { name: string }
      if (!body.name || !body.name.trim()) {
        return badRequest('Kategori adı boş olamaz.')
      }
      const created: SuggestionCategory = { id: nextCategoryId++, name: body.name }
      categories.push(created)
      return HttpResponse.json(created, { status: 201 })
    }),
    http.put(`${BASE_URL}/api/suggestions/categories/:id`, async ({ request, params }) => {
      const id = Number(params.id)
      const index = categories.findIndex((c) => c.id === id)
      if (index === -1) {
        return notFound('Kategori bulunamadı', 'Kategori bulunamadı.')
      }
      const body = (await request.json()) as { name: string }
      if (!body.name || !body.name.trim()) {
        return badRequest('Kategori adı boş olamaz.')
      }
      categories[index] = { id, name: body.name }
      return HttpResponse.json(categories[index])
    }),
    http.delete(`${BASE_URL}/api/suggestions/categories/:id`, ({ params }) => {
      const id = Number(params.id)
      const index = categories.findIndex((c) => c.id === id)
      if (index === -1) {
        return notFound('Kategori bulunamadı', 'Kategori bulunamadı.')
      }
      categories.splice(index, 1)
      return new HttpResponse(null, { status: 204 })
    }),

    http.post(`${BASE_URL}/api/suggestions`, async ({ request }) => {
      const body = (await request.json()) as {
        categoryId: number
        description: string
        employeeId: number | null
        anonymous: boolean
      }
      if (!categories.some((c) => c.id === body.categoryId)) {
        return notFound('Kategori bulunamadı', 'Kategori bulunamadı.')
      }
      if (!body.description || !body.description.trim()) {
        return badRequest('Açıklama boş olamaz.')
      }
      const created: Suggestion = {
        id: nextSuggestionId++,
        categoryId: body.categoryId,
        employeeId: body.anonymous ? null : body.employeeId,
        description: body.description,
        status: 'PENDING',
      }
      suggestions.push(created)
      return HttpResponse.json(created, { status: 201 })
    }),

    http.get(`${BASE_URL}/api/suggestions`, ({ request }) => {
      const url = new URL(request.url)
      const employeeIdParam = url.searchParams.get('employeeId')
      const content =
        employeeIdParam === null
          ? suggestions
          : suggestions.filter((s) => s.employeeId === Number(employeeIdParam))
      return HttpResponse.json([...content].sort((a, b) => b.id - a.id))
    }),

    http.put(`${BASE_URL}/api/suggestions/:id/status`, async ({ request, params }) => {
      const id = Number(params.id)
      const index = suggestions.findIndex((s) => s.id === id)
      if (index === -1) {
        return notFound('Talep bulunamadı', 'Talep bulunamadı.')
      }
      const body = (await request.json()) as { status: string }
      suggestions[index] = { ...suggestions[index], status: body.status as Suggestion['status'] }
      return HttpResponse.json(suggestions[index])
    }),
  ]
}
