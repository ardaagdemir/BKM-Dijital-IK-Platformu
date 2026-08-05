import { useQueries, useQuery } from '@tanstack/react-query'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useMemo, useState } from 'react'
import { ApiError } from '../../../shared/api/ApiError'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../../shared/components/ResponsiveTable'
import { useToast } from '../../../shared/components/ToastProvider'
import * as organizationApi from '../../organization/api/organizationApi'
import { useMyEmployee } from '../../organization/api/useMyEmployee'
import { useDecideEnrollment } from '../api/useDecideEnrollment'
import { useTrainings } from '../api/useTrainings'
import * as trainingApi from '../api/trainingApi'
import { RejectEnrollmentDialog } from '../components/RejectEnrollmentDialog'
import { trainingKeys } from '../queryKeys'
import type { RejectionReasonFormValues } from '../schema'
import type { TrainingEnrollment } from '../types'

// US-08A.1.2: "Talep, yöneticiye onaya gider" — `leave.LeaveApprovalsPage`'deki
// AYNI "kendi birimim = ekibim" istemci taraflı çözümleme + N+1 sorgu
// birleştirme deseni (bkz. o dosyadaki ayrıntılı not).
export function TrainingApprovalsPage() {
  const { showToast } = useToast()
  const {
    data: myEmployee,
    isPending: isMyEmployeePending,
    isError: isMyEmployeeError,
    error: myEmployeeError,
  } = useMyEmployee()
  const employeeMissing = isMyEmployeeError && myEmployeeError instanceof ApiError && myEmployeeError.status === 404

  const organizationUnitId = myEmployee?.organizationUnitId ?? undefined

  const {
    data: teamPage,
    isPending: isTeamPending,
    isError: isTeamError,
    refetch: refetchTeam,
  } = useQuery({
    queryKey: ['training', 'approvals', 'team', organizationUnitId],
    queryFn: () => organizationApi.searchEmployees({ organizationUnitId, page: 0, size: 100 }),
    enabled: !!organizationUnitId,
  })

  const teamMembers = useMemo(
    () => (teamPage?.content ?? []).filter((member) => member.id !== myEmployee?.id),
    [teamPage, myEmployee],
  )
  const teamEmployeeIds = useMemo(() => teamMembers.map((member) => member.id), [teamMembers])
  const employeeLabelById = useMemo(
    () => new Map(teamMembers.map((member) => [member.id, `${member.firstName} ${member.lastName}`])),
    [teamMembers],
  )

  const enrollmentQueries = useQueries({
    queries: teamMembers.map((member) => ({
      queryKey: trainingKeys.enrollments.byEmployee(member.id),
      queryFn: () => trainingApi.listEnrollments(member.id),
    })),
  })
  const isEnrollmentsPending = enrollmentQueries.some((query) => query.isPending)
  const isEnrollmentsError = enrollmentQueries.some((query) => query.isError)
  const pendingEnrollments = useMemo(
    () => enrollmentQueries.flatMap((query) => query.data ?? []).filter((enrollment) => enrollment.status === 'PENDING'),
    [enrollmentQueries],
  )

  const { data: trainings } = useTrainings()
  const trainingNameById = useMemo(() => new Map((trainings ?? []).map((t) => [t.id, t.name])), [trainings])

  const decideEnrollment = useDecideEnrollment()
  const [actionError, setActionError] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<TrainingEnrollment | null>(null)
  const [rejectError, setRejectError] = useState<string | null>(null)

  async function handleApprove(enrollment: TrainingEnrollment) {
    setActionError(null)
    try {
      await decideEnrollment.mutateAsync({
        id: enrollment.id,
        request: { decision: 'APPROVED', rejectionReason: null },
        teamEmployeeIds,
      })
      showToast('Talep onaylandı')
    } catch (error) {
      setActionError(error instanceof ApiError ? error.detail : 'İşlem başarısız, tekrar deneyin.')
    }
  }

  async function handleRejectSubmit(values: RejectionReasonFormValues) {
    if (!rejectTarget) {
      return
    }
    setRejectError(null)
    try {
      await decideEnrollment.mutateAsync({
        id: rejectTarget.id,
        request: { decision: 'REJECTED', rejectionReason: values.rejectionReason },
        teamEmployeeIds,
      })
      showToast('Talep reddedildi')
      setRejectTarget(null)
    } catch (error) {
      setRejectError(error instanceof ApiError ? error.detail : 'İşlem başarısız, tekrar deneyin.')
    }
  }

  if (isMyEmployeePending) {
    return (
      <>
        <PageHeader title="Eğitim Onayları" />
        <LoadingSkeleton rows={4} />
      </>
    )
  }

  if (employeeMissing) {
    return (
      <>
        <PageHeader title="Eğitim Onayları" />
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
        <PageHeader title="Eğitim Onayları" />
        <EmptyState message="Bir organizasyon birimine atanmadığınızdan ekibiniz belirlenemiyor." />
      </>
    )
  }

  if (isTeamPending || isEnrollmentsPending) {
    return (
      <>
        <PageHeader title="Eğitim Onayları" />
        <LoadingSkeleton rows={4} />
      </>
    )
  }

  if (isTeamError) {
    return <ErrorState message="Ekip bilgisi yüklenemedi." onRetry={() => refetchTeam()} />
  }

  if (isEnrollmentsError) {
    return (
      <ErrorState
        message="Eğitim talepleri yüklenemedi."
        onRetry={() => enrollmentQueries.forEach((query) => query.refetch())}
      />
    )
  }

  const columns: ResponsiveTableColumn<TrainingEnrollment>[] = [
    { key: 'employee', header: 'Çalışan', primary: true, render: (row) => employeeLabelById.get(row.employeeId) ?? '—' },
    { key: 'training', header: 'Eğitim', render: (row) => trainingNameById.get(row.trainingId) ?? '—' },
  ]

  return (
    <>
      <PageHeader title="Eğitim Onayları" />
      {actionError && <ErrorState message={actionError} onRetry={() => setActionError(null)} />}
      {teamMembers.length === 0 && <EmptyState message="Biriminizde başka bir çalışan yok." />}
      {teamMembers.length > 0 && pendingEnrollments.length === 0 && (
        <EmptyState message="Onay bekleyen eğitim talebi yok." />
      )}
      {pendingEnrollments.length > 0 && (
        <ResponsiveTable
          columns={columns}
          rows={pendingEnrollments}
          getRowKey={(row) => row.id}
          actions={(row) => (
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="contained" loading={decideEnrollment.isPending} onClick={() => handleApprove(row)}>
                Onayla
              </Button>
              <Button
                size="small"
                color="error"
                onClick={() => {
                  setRejectError(null)
                  setRejectTarget(row)
                }}
              >
                Reddet
              </Button>
            </Stack>
          )}
        />
      )}

      <RejectEnrollmentDialog
        open={!!rejectTarget}
        employeeLabel={rejectTarget ? (employeeLabelById.get(rejectTarget.employeeId) ?? '') : ''}
        submitting={decideEnrollment.isPending}
        errorMessage={rejectError}
        onSubmit={handleRejectSubmit}
        onCancel={() => setRejectTarget(null)}
      />
    </>
  )
}
