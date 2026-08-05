import { HttpResponse, http } from 'msw'
import type { ExpenseItem, TravelRequest } from '../../../src/modules/travel/types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

function notFound(title: string, detail: string) {
  return HttpResponse.json({ type: 'about:blank', title, status: 404, detail }, { status: 404 })
}

function badRequest(detail: string) {
  return HttpResponse.json({ type: 'about:blank', title: 'Geçersiz istek', status: 400, detail }, { status: 400 })
}

// `training.ts`/`recruitment.ts`'teki AYNI fabrika deseni.
export function createTravelHandlers(initialRequests: TravelRequest[] = [], initialExpenseItems: ExpenseItem[] = []) {
  const requests = [...initialRequests]
  const expenseItems = [...initialExpenseItems]
  let nextRequestId = requests.reduce((max, r) => Math.max(max, r.id), 0) + 1
  let nextExpenseItemId = expenseItems.reduce((max, e) => Math.max(max, e.id), 0) + 1

  return [
    http.post(`${BASE_URL}/api/travel/requests`, async ({ request }) => {
      const body = (await request.json()) as {
        employeeId: number
        location: string
        startDate: string
        endDate: string
        purpose: string
      }
      if (!body.location) {
        return badRequest('Lokasyon boş olamaz.')
      }
      if (!body.purpose) {
        return badRequest('Amaç boş olamaz.')
      }
      if (body.endDate < body.startDate) {
        return badRequest('Bitiş tarihi başlangıç tarihinden önce olamaz.')
      }
      const created: TravelRequest = { id: nextRequestId++, ...body }
      requests.push(created)
      return HttpResponse.json(created, { status: 201 })
    }),
    http.get(`${BASE_URL}/api/travel/requests`, ({ request }) => {
      const url = new URL(request.url)
      const employeeId = Number(url.searchParams.get('employeeId'))
      return HttpResponse.json(
        requests.filter((r) => r.employeeId === employeeId).sort((a, b) => (a.startDate < b.startDate ? 1 : -1)),
      )
    }),

    http.post(
      `${BASE_URL}/api/travel/requests/:travelRequestId/expense-items`,
      async ({ request, params }) => {
        const travelRequestId = Number(params.travelRequestId)
        if (!requests.some((r) => r.id === travelRequestId)) {
          return notFound('Seyahat talebi bulunamadı', 'Seyahat talebi bulunamadı.')
        }
        const formData = await request.formData()
        const amount = formData.get('amount') as string | null
        const document = formData.get('document') as File | null
        if (!amount || Number(amount) <= 0) {
          return badRequest('Tutar sıfırdan büyük olmalıdır.')
        }
        if (!document || document.size === 0) {
          return badRequest('Belge boş olamaz.')
        }
        if (document.name === 'enfekte.pdf') {
          return HttpResponse.json(
            {
              type: 'about:blank',
              title: 'Dosya reddedildi',
              status: 422,
              detail: 'Dosyada virüs/kötü amaçlı içerik tespit edildi.',
            },
            { status: 422 },
          )
        }
        const created: ExpenseItem = {
          id: nextExpenseItemId++,
          travelRequestId,
          amount: Number(amount),
          documentFileName: document.name,
          documentContentType: document.type,
          status: 'PENDING',
          rejectionReason: null,
        }
        expenseItems.push(created)
        return HttpResponse.json(created, { status: 201 })
      },
    ),

    http.get(`${BASE_URL}/api/travel/requests/:travelRequestId/expense-items`, ({ params }) => {
      const travelRequestId = Number(params.travelRequestId)
      if (!requests.some((r) => r.id === travelRequestId)) {
        return notFound('Seyahat talebi bulunamadı', 'Seyahat talebi bulunamadı.')
      }
      return HttpResponse.json(
        expenseItems.filter((e) => e.travelRequestId === travelRequestId).sort((a, b) => b.id - a.id),
      )
    }),

    http.get(`${BASE_URL}/api/travel/requests/:travelRequestId/expense-items/:id/document`, ({ params }) => {
      const id = Number(params.id)
      const item = expenseItems.find((e) => e.id === id)
      if (!item) {
        return notFound('Masraf kalemi bulunamadı', 'Masraf kalemi bulunamadı.')
      }
      return new HttpResponse('örnek belge içeriği', {
        status: 200,
        headers: {
          'Content-Type': item.documentContentType,
          'Content-Disposition': `attachment; filename="${item.documentFileName}"`,
        },
      })
    }),

    http.put(
      `${BASE_URL}/api/travel/requests/:travelRequestId/expense-items/:id/decision`,
      async ({ request, params }) => {
        const id = Number(params.id)
        const index = expenseItems.findIndex((e) => e.id === id)
        if (index === -1) {
          return notFound('Masraf kalemi bulunamadı', 'Masraf kalemi bulunamadı.')
        }
        if (expenseItems[index].status !== 'PENDING') {
          return badRequest('Bu kalem zaten karara bağlanmış.')
        }
        const body = (await request.json()) as { decision: 'APPROVED' | 'REJECTED'; rejectionReason: string | null }
        if (body.decision === 'REJECTED' && (!body.rejectionReason || !body.rejectionReason.trim())) {
          return badRequest('Ret gerekçesi zorunludur.')
        }
        expenseItems[index] = {
          ...expenseItems[index],
          status: body.decision,
          rejectionReason: body.decision === 'REJECTED' ? body.rejectionReason : null,
        }
        return HttpResponse.json(expenseItems[index])
      },
    ),
  ]
}
