import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { authHandlers } from '../../../../test/msw/handlers/auth'
import { createOrganizationHandlers } from '../../../../test/msw/handlers/organization'
import { createRecruitmentHandlers } from '../../../../test/msw/handlers/recruitment'
import { server } from '../../../../test/msw/server'
import { setToken } from '../../../shared/api/apiClient'
import { ToastProvider } from '../../../shared/components/ToastProvider'
import { AuthProvider } from '../../auth/AuthProvider'
import type { Employee, JobTitle, OrganizationUnit } from '../../organization/types'
import type { HiringRequest } from '../types'
import { HiringRequestsPage } from './HiringRequestsPage'

const units: OrganizationUnit[] = [{ id: 1, name: 'Yazılım', parentId: null }]
const jobTitles: JobTitle[] = [{ id: 1, name: 'Backend Geliştirici' }]

function makeRequest(overrides: Partial<HiringRequest> = {}): HiringRequest {
  return { id: 1, organizationUnitId: 1, jobTitleId: 1, status: 'PENDING', ...overrides }
}

function renderPage() {
  setToken('test-token')
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <HiringRequestsPage />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>,
  )
}

describe('HiringRequestsPage', () => {
  describe('ADMIN/IK görünümü (2. adım — organizasyon geneli)', () => {
    it('TÜM talepleri (durum StatusChip ile) listeler, yalnızca MANAGER_APPROVED aksiyon alabilir', async () => {
      server.use(
        authHandlers.meAdmin,
        ...createOrganizationHandlers(jobTitles, units, []),
        ...createRecruitmentHandlers(
          [],
          [],
          [
            makeRequest({ id: 1, status: 'PENDING' }),
            makeRequest({ id: 2, status: 'MANAGER_APPROVED' }),
          ],
        ),
      )
      renderPage()

      const table = await screen.findByRole('table')
      expect(within(table).getAllByRole('row')).toHaveLength(3) // başlık + 2 talep
      expect(within(table).getByText('Bekliyor')).toBeInTheDocument()
      expect(within(table).getByText('Yönetici Onayladı')).toBeInTheDocument()
      // Yalnızca 1 satırda (MANAGER_APPROVED) Onayla/Reddet düğmesi var.
      expect(within(table).getAllByRole('button', { name: 'Onayla' })).toHaveLength(1)
    })

    it('bir talep onaylanabilir', async () => {
      server.use(
        authHandlers.meAdmin,
        ...createOrganizationHandlers(jobTitles, units, []),
        ...createRecruitmentHandlers([], [], [makeRequest({ id: 1, status: 'MANAGER_APPROVED' })]),
      )
      renderPage()
      const user = userEvent.setup()

      const table = await screen.findByRole('table')
      await user.click(within(table).getByRole('button', { name: 'Onayla' }))

      expect(await screen.findByText('Talep onaylandı')).toBeInTheDocument()
      await within(table).findByText('Onaylandı')
    })
  })

  describe('YONETICI görünümü (1. adım — yalnızca kendi birimi)', () => {
    function makeEmployee(overrides: Partial<Employee> = {}): Employee {
      return {
        id: 1,
        firstName: 'Bir',
        lastName: 'Yönetici',
        nationalId: '10000000146',
        hireDate: '2020-01-15',
        email: 'yonetici@dijitalik.local',
        organizationUnitId: 1,
        jobTitleId: null,
        iban: null,
        ...overrides,
      }
    }

    it('yalnızca kendi biriminin taleplerini listeler, PENDING dışı satırlarda aksiyon YOK', async () => {
      server.use(
        authHandlers.meYonetici,
        ...createOrganizationHandlers(jobTitles, units, [makeEmployee()]),
        ...createRecruitmentHandlers(
          [],
          [],
          [
            makeRequest({ id: 1, organizationUnitId: 1, status: 'PENDING' }),
            makeRequest({ id: 2, organizationUnitId: 9, status: 'PENDING' }), // başka birim — GÖRÜNMEMELİ
          ],
        ),
      )
      renderPage()

      const table = await screen.findByRole('table')
      expect(within(table).getAllByRole('row')).toHaveLength(2) // başlık + 1 talep
      expect(within(table).getAllByRole('button', { name: 'Onayla' })).toHaveLength(1)
    })

    it('bir talep reddedilebilir', async () => {
      server.use(
        authHandlers.meYonetici,
        ...createOrganizationHandlers(jobTitles, units, [makeEmployee()]),
        ...createRecruitmentHandlers([], [], [makeRequest({ id: 1, organizationUnitId: 1, status: 'PENDING' })]),
      )
      renderPage()
      const user = userEvent.setup()

      const table = await screen.findByRole('table')
      await user.click(within(table).getByRole('button', { name: 'Reddet' }))

      expect(await screen.findByText('Talep reddedildi')).toBeInTheDocument()
      await within(table).findByText('Reddedildi')
    })
  })
})
