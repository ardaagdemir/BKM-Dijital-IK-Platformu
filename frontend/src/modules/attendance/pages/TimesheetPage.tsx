import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { ApiError } from '../../../shared/api/ApiError'
import { EmployeeAutocomplete } from '../../../shared/components/EmployeeAutocomplete'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../../shared/components/ResponsiveTable'
import { StatusChip } from '../../../shared/components/StatusChip'
import { useAuth } from '../../auth/AuthProvider'
import * as leaveApi from '../../leave/api/leaveApi'
import { useMyEmployee } from '../../organization/api/useMyEmployee'
import type { Employee } from '../../organization/types'
import { useTimesheet } from '../api/useTimesheet'
import { expandLeaveDates } from '../expandLeaveDates'
import { TIMESHEET_STATUS_LABELS } from '../statusLabels'
import type { TimesheetDay } from '../types'

const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
]

function formatMinutes(minutes: number | null): string {
  if (minutes === null) {
    return '—'
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}s ${mins}dk`
}

// US-07.3.1: Aylık puantaj — ADMIN/IK herhangi bir çalışanı seçebilir,
// CALISAN yalnızca KENDİ puantajını görür (roadmap'in "+ kendi puantajı:
// CALISAN" notu — `leave.LeaveBalancePage`'deki AYNI self-servis deseni).
// `leaveDates`, `leave` modülünden BU sayfa tarafından çözülüp backend'e
// AYRICA gönderilir (bkz. TimesheetService'in modüller-arası kompozisyon
// notu — attendanceApi.getTimesheet).
export function TimesheetPage() {
  const { user } = useAuth()
  const canPickAnyEmployee = !!user?.roles.some((role) => role === 'ADMIN' || role === 'IK')

  if (canPickAnyEmployee) {
    return <AdminTimesheetView />
  }
  return <OwnTimesheetView />
}

function OwnTimesheetView() {
  const { data: employee, isPending, isError, error } = useMyEmployee()
  const employeeMissing = isError && error instanceof ApiError && error.status === 404

  if (isPending) {
    return (
      <>
        <PageHeader title="Puantajım" />
        <LoadingSkeleton rows={4} />
      </>
    )
  }

  if (employeeMissing) {
    return (
      <>
        <PageHeader title="Puantajım" />
        <EmptyState message="Sisteme bağlı bir çalışan kaydınız bulunamadı." />
      </>
    )
  }

  if (isError || !employee) {
    return <ErrorState message="Çalışan bilgileri yüklenemedi." onRetry={() => window.location.reload()} />
  }

  return <TimesheetView title="Puantajım" employee={employee} showPicker={false} />
}

function AdminTimesheetView() {
  const [employee, setEmployee] = useState<Employee | null>(null)
  return <TimesheetView title="Puantaj" employee={employee} showPicker onEmployeeChange={setEmployee} />
}

type TimesheetViewProps = {
  title: string
  employee: Employee | null
  showPicker: boolean
  onEmployeeChange?: (employee: Employee | null) => void
}

function TimesheetView({ title, employee, showPicker, onEmployeeChange }: TimesheetViewProps) {
  const now = dayjs()
  const [year, setYear] = useState(now.year())
  const [month, setMonth] = useState(now.month() + 1)

  const { data: leaveRequests } = useQuery({
    queryKey: ['attendance', 'timesheet', 'leaveRequests', employee?.id],
    queryFn: () => leaveApi.listLeaveRequests(employee!.id),
    enabled: !!employee,
  })
  const leaveDates = useMemo(() => expandLeaveDates(leaveRequests ?? []), [leaveRequests])

  const {
    data: timesheet,
    isPending,
    isError,
    error,
    refetch,
  } = useTimesheet(employee ? { employeeId: employee.id, year, month, leaveDates } : undefined)
  const assignmentMissing = isError && error instanceof ApiError && error.status === 404

  const columns: ResponsiveTableColumn<TimesheetDay>[] = [
    { key: 'date', header: 'Tarih', primary: true, render: (row) => row.date },
    { key: 'status', header: 'Durum', render: (row) => <StatusChip {...TIMESHEET_STATUS_LABELS[row.status]} /> },
    { key: 'workedMinutes', header: 'Çalışılan', render: (row) => formatMinutes(row.workedMinutes) },
    { key: 'plannedMinutes', header: 'Planlanan', render: (row) => formatMinutes(row.plannedMinutes) },
  ]

  return (
    <>
      <PageHeader title={title} />
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {showPicker && (
          <Grid size={{ xs: 12, sm: 4 }}>
            <EmployeeAutocomplete label="Çalışan" value={employee} onChange={onEmployeeChange!} />
          </Grid>
        )}
        <Grid size={{ xs: 6, sm: 4 }}>
          <TextField
            select
            label="Ay"
            fullWidth
            value={month}
            onChange={(event) => setMonth(Number(event.target.value))}
          >
            {MONTHS.map((name, index) => (
              <MenuItem key={name} value={index + 1}>
                {name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <TextField
            type="number"
            label="Yıl"
            fullWidth
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
          />
        </Grid>
      </Grid>

      {!employee && <EmptyState message="Puantajı görüntülemek için bir çalışan seçin." />}
      {employee && isPending && <LoadingSkeleton rows={6} />}
      {employee && assignmentMissing && (
        <EmptyState message="Bu çalışan için henüz bir çalışma modeli ataması yok." />
      )}
      {employee && isError && !assignmentMissing && (
        <ErrorState message="Puantaj yüklenemedi." onRetry={() => refetch()} />
      )}
      {employee && !isPending && !isError && !!timesheet?.days.length && (
        <ResponsiveTable columns={columns} rows={timesheet.days} getRowKey={(row) => row.date} />
      )}
    </>
  )
}
