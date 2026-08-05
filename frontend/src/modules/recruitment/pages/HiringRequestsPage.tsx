import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useMemo, useState } from 'react'
import { ApiError } from '../../../shared/api/ApiError'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../../shared/components/ResponsiveTable'
import { StatusChip } from '../../../shared/components/StatusChip'
import { useToast } from '../../../shared/components/ToastProvider'
import { useAuth } from '../../auth/AuthProvider'
import { useJobTitles } from '../../organization/api/useJobTitles'
import { useMyEmployee } from '../../organization/api/useMyEmployee'
import { useUnits } from '../../organization/api/useUnits'
import { useHiringRequests } from '../api/useHiringRequests'
import { useHrDecideHiringRequest } from '../api/useHrDecideHiringRequest'
import { useManagerDecideHiringRequest } from '../api/useManagerDecideHiringRequest'
import { HIRING_REQUEST_STATUS_LABELS } from '../statusLabels'
import type { HiringRequest } from '../types'

// US-05.3.2: İki aşamalı onay ekranı — roadmap'in rol tablosu ("YONETICI 1.
// adım, İK 2. adım") gereği TEK ekran, İKİ farklı görünüm: ADMIN/IK
// organizasyon geneli `MANAGER_APPROVED` kuyruğunu görür (`hr-decision`),
// YONETICI yalnızca KENDİ biriminin `PENDING` kuyruğunu görür
// (`manager-decision`, `teamOrganizationUnitIds` güven-sınırı — bkz.
// `HiringRequestAccessGuard`). Roadmap'in "PENDING/MANAGER_APPROVED/
// APPROVED/REJECTED durumlarını StatusChip ile gösterir" kabul kriteri
// gereği TÜM geçmiş (yalnızca aksiyon alınabilir olanlar DEĞİL) listelenir.
export function HiringRequestsPage() {
  const { user } = useAuth()
  const isHr = !!user?.roles.some((role) => role === 'ADMIN' || role === 'IK')

  if (isHr) {
    return <HrQueue />
  }
  return <ManagerQueue />
}

function useLookups() {
  const { data: units } = useUnits()
  const { data: jobTitles } = useJobTitles()
  const unitNameById = useMemo(() => new Map((units ?? []).map((unit) => [unit.id, unit.name])), [units])
  const jobTitleNameById = useMemo(
    () => new Map((jobTitles ?? []).map((jobTitle) => [jobTitle.id, jobTitle.name])),
    [jobTitles],
  )
  return { unitNameById, jobTitleNameById }
}

function buildColumns(
  unitNameById: Map<number, string>,
  jobTitleNameById: Map<number, string>,
): ResponsiveTableColumn<HiringRequest>[] {
  return [
    {
      key: 'unit',
      header: 'Organizasyon Birimi',
      primary: true,
      render: (row) => unitNameById.get(row.organizationUnitId) ?? `#${row.organizationUnitId}`,
    },
    { key: 'jobTitle', header: 'Unvan', render: (row) => jobTitleNameById.get(row.jobTitleId) ?? `#${row.jobTitleId}` },
    { key: 'status', header: 'Durum', render: (row) => <StatusChip {...HIRING_REQUEST_STATUS_LABELS[row.status]} /> },
  ]
}

// ADMIN/IK — organizasyon geneli, `organizationUnitId` filtresi YOK.
function HrQueue() {
  const { showToast } = useToast()
  const { data: requests, isPending, isError, refetch } = useHiringRequests()
  const { unitNameById, jobTitleNameById } = useLookups()
  const hrDecide = useHrDecideHiringRequest()
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleDecide(id: number, decision: 'APPROVED' | 'REJECTED') {
    setActionError(null)
    try {
      await hrDecide.mutateAsync({ id, decision })
      showToast(decision === 'APPROVED' ? 'Talep onaylandı' : 'Talep reddedildi')
    } catch (error) {
      setActionError(error instanceof ApiError ? error.detail : 'İşlem başarısız, tekrar deneyin.')
    }
  }

  if (isPending) {
    return (
      <>
        <PageHeader title="İşe Alım Talepleri" />
        <LoadingSkeleton rows={4} />
      </>
    )
  }

  if (isError) {
    return <ErrorState message="İşe alım talepleri yüklenemedi." onRetry={() => refetch()} />
  }

  return (
    <>
      <PageHeader title="İşe Alım Talepleri" />
      {actionError && <ErrorState message={actionError} onRetry={() => setActionError(null)} />}
      {requests?.length === 0 && <EmptyState message="Henüz bir işe alım talebi yok." />}
      {!!requests?.length && (
        <ResponsiveTable
          columns={buildColumns(unitNameById, jobTitleNameById)}
          rows={requests}
          getRowKey={(row) => row.id}
          actions={(row) =>
            row.status === 'MANAGER_APPROVED' ? (
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="contained" loading={hrDecide.isPending} onClick={() => handleDecide(row.id, 'APPROVED')}>
                  Onayla
                </Button>
                <Button size="small" color="error" loading={hrDecide.isPending} onClick={() => handleDecide(row.id, 'REJECTED')}>
                  Reddet
                </Button>
              </Stack>
            ) : null
          }
        />
      )}
    </>
  )
}

// YONETICI — yalnızca KENDİ birimi (`/employees/me` ile çözülür, `leave`
// modülünün Onay Bekleyenler sayfasındaki AYNI "kendi birimim = ekibim"
// varsayımı — bkz. o sayfadaki ayrıntılı not).
function ManagerQueue() {
  const { showToast } = useToast()
  const {
    data: myEmployee,
    isPending: isMyEmployeePending,
    isError: isMyEmployeeError,
    error: myEmployeeError,
  } = useMyEmployee()
  const employeeMissing = isMyEmployeeError && myEmployeeError instanceof ApiError && myEmployeeError.status === 404
  const organizationUnitId = myEmployee?.organizationUnitId ?? undefined

  const { data: requests, isPending, isError, refetch } = useHiringRequests(organizationUnitId)
  const { unitNameById, jobTitleNameById } = useLookups()
  const managerDecide = useManagerDecideHiringRequest()
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleDecide(id: number, decision: 'APPROVED' | 'REJECTED') {
    if (!organizationUnitId) {
      return
    }
    setActionError(null)
    try {
      await managerDecide.mutateAsync({ id, decision, teamOrganizationUnitIds: [organizationUnitId] })
      showToast(decision === 'APPROVED' ? 'Talep onaylandı' : 'Talep reddedildi')
    } catch (error) {
      setActionError(error instanceof ApiError ? error.detail : 'İşlem başarısız, tekrar deneyin.')
    }
  }

  if (isMyEmployeePending) {
    return (
      <>
        <PageHeader title="İşe Alım Talepleri" />
        <LoadingSkeleton rows={4} />
      </>
    )
  }

  if (employeeMissing) {
    return (
      <>
        <PageHeader title="İşe Alım Talepleri" />
        <EmptyState message="Sisteme bağlı bir çalışan kaydınız bulunamadı." />
      </>
    )
  }

  if (isMyEmployeeError || !myEmployee) {
    return <ErrorState message="Çalışan bilgileri yüklenemedi." onRetry={() => window.location.reload()} />
  }

  if (!organizationUnitId) {
    return (
      <>
        <PageHeader title="İşe Alım Talepleri" />
        <EmptyState message="Bir organizasyon birimine atanmadığınızdan talepleriniz belirlenemiyor." />
      </>
    )
  }

  if (isPending) {
    return (
      <>
        <PageHeader title="İşe Alım Talepleri" />
        <LoadingSkeleton rows={4} />
      </>
    )
  }

  if (isError) {
    return <ErrorState message="İşe alım talepleri yüklenemedi." onRetry={() => refetch()} />
  }

  return (
    <>
      <PageHeader title="İşe Alım Talepleri" />
      {actionError && <ErrorState message={actionError} onRetry={() => setActionError(null)} />}
      {requests?.length === 0 && <EmptyState message="Biriminiz için henüz bir işe alım talebi yok." />}
      {!!requests?.length && (
        <ResponsiveTable
          columns={buildColumns(unitNameById, jobTitleNameById)}
          rows={requests}
          getRowKey={(row) => row.id}
          actions={(row) =>
            row.status === 'PENDING' ? (
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="contained"
                  loading={managerDecide.isPending}
                  onClick={() => handleDecide(row.id, 'APPROVED')}
                >
                  Onayla
                </Button>
                <Button size="small" color="error" loading={managerDecide.isPending} onClick={() => handleDecide(row.id, 'REJECTED')}>
                  Reddet
                </Button>
              </Stack>
            ) : null
          }
        />
      )}
    </>
  )
}
