import Grid from '@mui/material/Grid'
import dayjs from 'dayjs'
import { useState } from 'react'
import { ApiError } from '../../../shared/api/ApiError'
import { EmployeeAutocomplete } from '../../../shared/components/EmployeeAutocomplete'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../../shared/components/ResponsiveTable'
import type { Employee } from '../../organization/types'
import { useAttendanceDeviations } from '../api/useAttendanceDeviations'
import type { AttendanceDeviation } from '../types'

function formatDateTime(iso: string | null): string {
  return iso ? dayjs(iso).format('DD.MM.YYYY HH:mm') : '—'
}

function formatMinutes(minutes: number | null): string {
  return minutes === null ? '—' : minutes === 0 ? 'Yok' : `${minutes} dk`
}

// US-07.2.2: Planlanan vardiya vs. fiili sapma — çalışma modeli ataması
// YOKSA backend 404 döner (bkz. AttendanceDeviationService), bu ekranda
// "önce çalışma modeli atayın" şeklinde anlaşılır bir boş durum gösterilir.
export function AttendanceDeviationsPage() {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const { data: deviations, isPending, isError, error, refetch } = useAttendanceDeviations(employee?.id)
  const assignmentMissing = isError && error instanceof ApiError && error.status === 404

  const columns: ResponsiveTableColumn<AttendanceDeviation>[] = [
    { key: 'checkInAt', header: 'Giriş', primary: true, render: (row) => formatDateTime(row.checkInAt) },
    { key: 'checkOutAt', header: 'Çıkış', render: (row) => formatDateTime(row.checkOutAt) },
    { key: 'lateMinutes', header: 'Geç Kalma', render: (row) => formatMinutes(row.lateMinutes) },
    { key: 'earlyDepartureMinutes', header: 'Erken Çıkış', render: (row) => formatMinutes(row.earlyDepartureMinutes) },
  ]

  return (
    <>
      <PageHeader title="Vardiya Sapmaları" />
      <Grid container sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <EmployeeAutocomplete label="Çalışan" value={employee} onChange={setEmployee} />
        </Grid>
      </Grid>

      {!employee && <EmptyState message="Sapmaları görüntülemek için bir çalışan seçin." />}
      {employee && isPending && <LoadingSkeleton rows={5} />}
      {employee && assignmentMissing && (
        <EmptyState message="Bu çalışan için henüz bir çalışma modeli ataması yok." />
      )}
      {employee && isError && !assignmentMissing && (
        <ErrorState message="Sapmalar yüklenemedi." onRetry={() => refetch()} />
      )}
      {employee && !isPending && !isError && deviations?.length === 0 && (
        <EmptyState message="Bu çalışan için henüz bir devam kaydı yok." />
      )}
      {employee && !isPending && !isError && !!deviations?.length && (
        <ResponsiveTable columns={columns} rows={deviations} getRowKey={(row) => row.attendanceRecordId} />
      )}
    </>
  )
}
