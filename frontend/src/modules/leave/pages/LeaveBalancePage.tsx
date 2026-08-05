import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import { ApiError } from '../../../shared/api/ApiError'
import { DetailField } from '../../../shared/components/DetailField'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { useMyEmployee } from '../../organization/api/useMyEmployee'
import { useLeaveBalance } from '../api/useLeaveBalance'
import { formatDays } from '../format'

// US-04.1.2/US-04.1.3: "hak ediş/kullanılan/bekleyen/kalan" kart görünümü.
// `employeeId`, `useMyEmployee` (14.3'ün ön-koşulu, bkz. Employee↔User
// bağlantısızlığı notu) ile çözülür — kayıt yoksa (ör. çalışan olmayan bir
// hesap) HATA değil, anlaşılır bir boş durum gösterilir.
export function LeaveBalancePage() {
  const { data: employee, isPending: isEmployeePending, isError: isEmployeeError, error: employeeError } = useMyEmployee()
  const employeeMissing = isEmployeeError && employeeError instanceof ApiError && employeeError.status === 404

  const {
    data: balance,
    isPending: isBalancePending,
    isError: isBalanceError,
    refetch,
  } = useLeaveBalance(employee ? { employeeId: employee.id, hireDate: employee.hireDate } : undefined)

  if (isEmployeePending) {
    return (
      <>
        <PageHeader title="İzin Bakiyem" />
        <LoadingSkeleton rows={3} />
      </>
    )
  }

  if (employeeMissing) {
    return (
      <>
        <PageHeader title="İzin Bakiyem" />
        <EmptyState message="Sisteme bağlı bir çalışan kaydınız bulunamadı." />
      </>
    )
  }

  if (isEmployeeError || !employee) {
    return <ErrorState message="Çalışan bilgileri yüklenemedi." onRetry={() => window.location.reload()} />
  }

  if (isBalancePending) {
    return (
      <>
        <PageHeader title="İzin Bakiyem" />
        <LoadingSkeleton rows={3} />
      </>
    )
  }

  if (isBalanceError || !balance) {
    return <ErrorState message="İzin bakiyesi yüklenemedi." onRetry={() => refetch()} />
  }

  return (
    <>
      <PageHeader title="İzin Bakiyem" />
      <Paper sx={{ p: { xs: 2, sm: 3 }, maxWidth: 560 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <DetailField label="Hak Ediş" value={formatDays(balance.entitlementDays)} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <DetailField label="Kullanılan" value={formatDays(balance.usedDays)} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <DetailField label="Bekleyen" value={formatDays(balance.pendingDays)} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <DetailField label="Kalan" value={formatDays(balance.remainingDays)} />
          </Grid>
        </Grid>
      </Paper>
    </>
  )
}
