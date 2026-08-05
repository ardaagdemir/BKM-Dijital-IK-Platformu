import Grid from '@mui/material/Grid'
import dayjs from 'dayjs'
import { useState } from 'react'
import { EmployeeAutocomplete } from '../../../shared/components/EmployeeAutocomplete'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../../shared/components/ResponsiveTable'
import type { Employee } from '../../organization/types'
import { useAttendanceRecords } from '../api/useAttendanceRecords'
import type { AttendanceRecord } from '../types'

function formatDateTime(iso: string | null): string {
  return iso ? dayjs(iso).format('DD.MM.YYYY HH:mm') : '—'
}

// US-07.2.1: Fiili giriş-çıkış kayıtları — YALNIZCA GÖRÜNTÜLEME (roadmap'in
// kendi notu: "veri girişi PDKS entegrasyonundan gelir"), bu yüzden ekranda
// HİÇBİR oluşturma/düzenleme formu YOK — yalnızca bir çalışan seçip
// KENDİ kayıtlarını listeleyen salt-okunur bir görünüm.
export function AttendanceRecordsPage() {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const { data: records, isPending, isError, refetch } = useAttendanceRecords(employee?.id)

  const columns: ResponsiveTableColumn<AttendanceRecord>[] = [
    { key: 'checkInAt', header: 'Giriş', primary: true, render: (row) => formatDateTime(row.checkInAt) },
    { key: 'checkOutAt', header: 'Çıkış', render: (row) => formatDateTime(row.checkOutAt) },
  ]

  return (
    <>
      <PageHeader title="Devam Kayıtları" />
      <Grid container sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <EmployeeAutocomplete label="Çalışan" value={employee} onChange={setEmployee} />
        </Grid>
      </Grid>

      {!employee && <EmptyState message="Kayıtları görüntülemek için bir çalışan seçin." />}
      {employee && isPending && <LoadingSkeleton rows={5} />}
      {employee && isError && <ErrorState message="Devam kayıtları yüklenemedi." onRetry={() => refetch()} />}
      {employee && !isPending && !isError && records?.length === 0 && (
        <EmptyState message="Bu çalışan için henüz bir devam kaydı yok." />
      )}
      {employee && !isPending && !isError && !!records?.length && (
        <ResponsiveTable columns={columns} rows={records} getRowKey={(row) => row.id} />
      )}
    </>
  )
}
