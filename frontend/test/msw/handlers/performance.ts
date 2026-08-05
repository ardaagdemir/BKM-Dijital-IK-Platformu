import { HttpResponse, http } from 'msw'
import type {
  AssessmentScore,
  AssessmentWeightConfig,
  Competency,
  Goal,
  ManagerAssessment,
  RatingScale,
} from '../../../src/modules/performance/types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

function notFound(title: string, detail: string) {
  return HttpResponse.json({ type: 'about:blank', title, status: 404, detail }, { status: 404 })
}

function badRequest(detail: string) {
  return HttpResponse.json({ type: 'about:blank', title: 'Geçersiz istek', status: 400, detail }, { status: 400 })
}

// `leave.ts`/`recruitment.ts`'teki AYNI fabrika deseni.
export function createPerformanceHandlers(
  initialGoals: Goal[] = [],
  initialCompetencies: Competency[] = [],
  initialRatingScale: RatingScale | null = null,
  initialWeightConfig: AssessmentWeightConfig | null = null,
  initialManagerAssessments: ManagerAssessment[] = [],
) {
  const goals = [...initialGoals]
  const competencies = [...initialCompetencies]
  let ratingScale = initialRatingScale
  let weightConfig = initialWeightConfig
  const managerAssessments = [...initialManagerAssessments]
  let nextGoalId = goals.reduce((max, g) => Math.max(max, g.id), 0) + 1
  let nextCompetencyId = competencies.reduce((max, c) => Math.max(max, c.id), 0) + 1
  let nextManagerAssessmentId = managerAssessments.reduce((max, m) => Math.max(max, m.id), 0) + 1
  let nextScoreId = 1

  function scoreListFromRequest(body: { scores?: { itemType: string; itemId: number; score: number }[] }): AssessmentScore[] {
    return (body.scores ?? []).map((score) => ({
      id: nextScoreId++,
      itemType: score.itemType as AssessmentScore['itemType'],
      itemId: score.itemId,
      score: score.score,
    }))
  }

  function computeFinalScore(managerAssessment: ManagerAssessment) {
    if (!weightConfig) {
      return null
    }
    const goalScores = managerAssessment.scores.filter((s) => s.itemType === 'GOAL')
    const competencyScores = managerAssessment.scores.filter((s) => s.itemType === 'COMPETENCY')

    function categoryScore(scores: AssessmentScore[], pool: Goal[] | Competency[]) {
      if (scores.length === 0) {
        return null
      }
      let weightedSum = 0
      let weightTotal = 0
      scores.forEach((score) => {
        const item = pool.find((p) => p.id === score.itemId)
        const weight = item?.weight ?? 0
        weightedSum += score.score * weight
        weightTotal += weight
      })
      return weightTotal === 0 ? null : weightedSum / weightTotal
    }

    const goalScore = categoryScore(goalScores, goals)
    const competencyScore = categoryScore(competencyScores, competencies)
    if (goalScore === null && competencyScore === null) {
      return null
    }
    const weightSum = (goalScore !== null ? weightConfig.goalWeight : 0) + (competencyScore !== null ? weightConfig.competencyWeight : 0)
    const finalScore =
      ((goalScore !== null ? goalScore * weightConfig.goalWeight : 0) +
        (competencyScore !== null ? competencyScore * weightConfig.competencyWeight : 0)) /
      weightSum
    return { goalScore, competencyScore, finalScore }
  }

  return [
    http.get(`${BASE_URL}/api/performance/goals`, () => HttpResponse.json(goals)),
    http.post(`${BASE_URL}/api/performance/goals`, async ({ request }) => {
      const body = (await request.json()) as { name: string; weight: number }
      if (!body.name) {
        return badRequest('Hedef adı boş olamaz.')
      }
      if (!body.weight || body.weight < 1 || body.weight > 100) {
        return badRequest('Ağırlık 1 ile 100 arasında olmalıdır.')
      }
      const existingTotal = goals.reduce((sum, g) => sum + g.weight, 0)
      if (existingTotal + body.weight > 100) {
        return badRequest(
          `Hedeflerin ağırlık toplamı 100'ü geçemez (mevcut toplam: ${existingTotal}, eklenmek istenen: ${body.weight}).`,
        )
      }
      const created: Goal = { id: nextGoalId++, name: body.name, weight: body.weight }
      goals.push(created)
      return HttpResponse.json(created, { status: 201 })
    }),
    http.put(`${BASE_URL}/api/performance/goals/:id`, async ({ request, params }) => {
      const id = Number(params.id)
      const index = goals.findIndex((g) => g.id === id)
      if (index === -1) {
        return notFound('Hedef bulunamadı', 'Hedef bulunamadı.')
      }
      const body = (await request.json()) as { name: string; weight: number }
      goals[index] = { id, name: body.name, weight: body.weight }
      return HttpResponse.json(goals[index])
    }),
    http.delete(`${BASE_URL}/api/performance/goals/:id`, ({ params }) => {
      const id = Number(params.id)
      const index = goals.findIndex((g) => g.id === id)
      if (index === -1) {
        return notFound('Hedef bulunamadı', 'Hedef bulunamadı.')
      }
      goals.splice(index, 1)
      return new HttpResponse(null, { status: 204 })
    }),

    http.get(`${BASE_URL}/api/performance/competencies`, () => HttpResponse.json(competencies)),
    http.post(`${BASE_URL}/api/performance/competencies`, async ({ request }) => {
      const body = (await request.json()) as { name: string; weight: number }
      if (!body.name) {
        return badRequest('Yetkinlik adı boş olamaz.')
      }
      if (!body.weight || body.weight < 1 || body.weight > 100) {
        return badRequest('Ağırlık 1 ile 100 arasında olmalıdır.')
      }
      const existingTotal = competencies.reduce((sum, c) => sum + c.weight, 0)
      if (existingTotal + body.weight > 100) {
        return badRequest(
          `Yetkinliklerin ağırlık toplamı 100'ü geçemez (mevcut toplam: ${existingTotal}, eklenmek istenen: ${body.weight}).`,
        )
      }
      const created: Competency = { id: nextCompetencyId++, name: body.name, weight: body.weight }
      competencies.push(created)
      return HttpResponse.json(created, { status: 201 })
    }),
    http.put(`${BASE_URL}/api/performance/competencies/:id`, async ({ request, params }) => {
      const id = Number(params.id)
      const index = competencies.findIndex((c) => c.id === id)
      if (index === -1) {
        return notFound('Yetkinlik bulunamadı', 'Yetkinlik bulunamadı.')
      }
      const body = (await request.json()) as { name: string; weight: number }
      competencies[index] = { id, name: body.name, weight: body.weight }
      return HttpResponse.json(competencies[index])
    }),
    http.delete(`${BASE_URL}/api/performance/competencies/:id`, ({ params }) => {
      const id = Number(params.id)
      const index = competencies.findIndex((c) => c.id === id)
      if (index === -1) {
        return notFound('Yetkinlik bulunamadı', 'Yetkinlik bulunamadı.')
      }
      competencies.splice(index, 1)
      return new HttpResponse(null, { status: 204 })
    }),

    http.get(`${BASE_URL}/api/performance/rating-scale`, () => {
      if (!ratingScale) {
        return notFound('Puanlama skalası bulunamadı', 'Puanlama skalası henüz tanımlanmamış.')
      }
      return HttpResponse.json(ratingScale)
    }),
    http.put(`${BASE_URL}/api/performance/rating-scale`, async ({ request }) => {
      const body = (await request.json()) as { minValue: number; maxValue: number }
      if (body.minValue < 1) {
        return badRequest("Alt sınır 1'den küçük olamaz.")
      }
      if (body.maxValue <= body.minValue) {
        return badRequest('Üst sınır, alt sınırdan büyük olmalıdır.')
      }
      ratingScale = { id: ratingScale?.id ?? 1, minValue: body.minValue, maxValue: body.maxValue }
      return HttpResponse.json(ratingScale)
    }),

    http.get(`${BASE_URL}/api/performance/assessment-weight-config`, () => {
      if (!weightConfig) {
        return notFound('Ağırlıklandırma bulunamadı', 'Nihai not ağırlıklandırması henüz tanımlanmamış.')
      }
      return HttpResponse.json(weightConfig)
    }),
    http.put(`${BASE_URL}/api/performance/assessment-weight-config`, async ({ request }) => {
      const body = (await request.json()) as { goalWeight: number; competencyWeight: number }
      if (body.goalWeight + body.competencyWeight !== 100) {
        return badRequest('Hedef ve yetkinlik ağırlıklarının toplamı 100 olmalıdır.')
      }
      weightConfig = { id: weightConfig?.id ?? 1, goalWeight: body.goalWeight, competencyWeight: body.competencyWeight }
      return HttpResponse.json(weightConfig)
    }),

    http.get(`${BASE_URL}/api/performance/self-assessments/form`, () => {
      if (!ratingScale) {
        return notFound('Puanlama skalası bulunamadı', 'Puanlama skalası henüz tanımlanmamış.')
      }
      return HttpResponse.json({ goals, competencies, scale: ratingScale })
    }),
    http.post(`${BASE_URL}/api/performance/self-assessments`, async ({ request }) => {
      const body = (await request.json()) as { employeeId: number; scores: { itemType: string; itemId: number; score: number }[] }
      if (!body.scores || body.scores.length === 0) {
        return badRequest('En az bir puan girilmelidir.')
      }
      if (ratingScale) {
        const outOfRange = body.scores.find((s) => s.score < ratingScale!.minValue || s.score > ratingScale!.maxValue)
        if (outOfRange) {
          return badRequest(`Puan ${ratingScale.minValue} ile ${ratingScale.maxValue} arasında olmalıdır.`)
        }
      }
      const created = { id: 1, employeeId: body.employeeId, scores: scoreListFromRequest(body) }
      return HttpResponse.json(created, { status: 201 })
    }),

    http.post(`${BASE_URL}/api/performance/manager-assessments`, async ({ request }) => {
      const body = (await request.json()) as {
        employeeId: number
        period: string
        scores: { itemType: string; itemId: number; score: number }[]
      }
      if (!body.period) {
        return badRequest('Dönem boş olamaz.')
      }
      if (!body.scores || body.scores.length === 0) {
        return badRequest('En az bir puan girilmelidir.')
      }
      const created: ManagerAssessment = {
        id: nextManagerAssessmentId++,
        employeeId: body.employeeId,
        period: body.period,
        scores: scoreListFromRequest(body),
      }
      managerAssessments.push(created)
      return HttpResponse.json(created, { status: 201 })
    }),
    http.get(`${BASE_URL}/api/performance/manager-assessments`, ({ request }) => {
      const url = new URL(request.url)
      const employeeId = Number(url.searchParams.get('employeeId'))
      const content = managerAssessments
        .filter((m) => m.employeeId === employeeId)
        .sort((a, b) => (a.period < b.period ? 1 : -1))
        .map((m) => ({
          id: m.id,
          employeeId: m.employeeId,
          period: m.period,
          finalScore: computeFinalScore(m)?.finalScore ?? null,
        }))
      return HttpResponse.json(content)
    }),
    http.get(`${BASE_URL}/api/performance/manager-assessments/:id/final-score`, ({ params }) => {
      const id = Number(params.id)
      const managerAssessment = managerAssessments.find((m) => m.id === id)
      if (!managerAssessment) {
        return notFound('Yönetici değerlendirmesi bulunamadı', 'Yönetici değerlendirmesi bulunamadı.')
      }
      const result = computeFinalScore(managerAssessment)
      if (!result) {
        return badRequest('Nihai not hesaplanamaz: bu değerlendirmede hiç puan yok.')
      }
      return HttpResponse.json({
        managerAssessmentId: id,
        goalScore: result.goalScore,
        competencyScore: result.competencyScore,
        goalWeight: weightConfig?.goalWeight ?? 0,
        competencyWeight: weightConfig?.competencyWeight ?? 0,
        finalScore: result.finalScore,
      })
    }),
  ]
}
