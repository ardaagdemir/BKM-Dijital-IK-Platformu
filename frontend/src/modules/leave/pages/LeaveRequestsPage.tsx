import AddIcon from '@mui/icons-material/Add'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../../shared/api/ApiError'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../../shared/components/ResponsiveTable'
import { StatusChip } from '../../../shared/components/StatusChip'
import { useToast } from '../../../shared/components/ToastProvider'
import { downloadBlob } from '../../../shared/utils/downloadBlob'
import { useAuth } from '../../auth/AuthProvider'
import { useMyEmployee } from '../../organization/api/useMyEmployee'
import * as leaveApi from '../api/leaveApi'
import { useLeaveRequests } from '../api/useLeaveRequests'
import { useLeaveTypes } from '../api/useLeaveTypes'
import { LEAVE_STATUS_LABELS } from '../statusLabels'
import type { LeaveRequest, LeaveRequestStatus } from '../types'

const STATUS_FILTER_OPTIONS: { value: LeaveRequestStatus | ''; label: string }[] = [
  { value: '', label: 'Tümü' },
  { value: 'PENDING', label: 'Bekliyor' },
  { value: 'APPROVED', label: 'Onaylandı' },
  { value: 'REJECTED', label: 'Reddedildi' },
]

// US-04.2.4: "kendi taleplerim" — durum filtresi İSTEMCİ tarafında yapılır
// (backend bunu desteklemiyor, zaten sayfalanmamış düz bir liste döner).
// Dışa aktarma yalnızca ADMIN/IK'ya GÖSTERİLİR (roadmap'in kendi rol
// tablosu — GÖRSEL bir sınır, backend `employeeId` parametresini rol
// FARKI GÖZETMEKSİZİN kabul ediyor).
export function LeaveRequestsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()
  const canExport = !!user?.roles.some((role) => role === 'ADMIN' || role === 'IK')

  const { data: employee, isPending: isEmployeePending, isError: isEmployeeError, error: employeeError } = useMyEmployee()
  const employeeMissing = isEmployeeError && employeeError instanceof ApiError && employeeError.status === 404

  const { data: requests, isPending, isError, refetch } = useLeaveRequests(employee?.id)
  const { data: leaveTypes } = useLeaveTypes()
  const leaveTypeNameById = useMemo(() => new Map((leaveTypes ?? []).map((type) => [type.id, type.name])), [leaveTypes])

  const [statusFilter, setStatusFilter] = useState<LeaveRequestStatus | ''>('')
  const [exportMenuAnchor, setExportMenuAnchor] = useState<HTMLElement | null>(null)
  const [exporting, setExporting] = useState(false)

  const filtered = useMemo(() => {
    if (!requests) {
      return []
    }
    if (!statusFilter) {
      return requests
    }
    return requests.filter((request) => request.status === statusFilter)
  }, [requests, statusFilter])

  async function handleExport(format: 'csv' | 'xlsx') {
    if (!employee) {
      return
    }
    setExportMenuAnchor(null)
    setExporting(true)
    try {
      const blob = await leaveApi.exportLeaveRequests({ employeeId: employee.id, format })
      downloadBlob(blob, `izin-gecmisi.${format}`)
    } catch (error) {
      showToast(error instanceof ApiError ? error.detail : 'Dışa aktarma başarısız oldu, tekrar deneyin.', 'error')
    } finally {
      setExporting(false)
    }
  }

  if (isEmployeePending) {
    return (
      <>
        <PageHeader title="İzin Taleplerim" />
        <LoadingSkeleton rows={4} />
      </>
    )
  }

  if (employeeMissing) {
    return (
      <>
        <PageHeader title="İzin Taleplerim" />
        <EmptyState message="Sisteme bağlı bir çalışan kaydınız bulunamadı." />
      </>
    )
  }

  if (isEmployeeError || !employee) {
    return <ErrorState message="Çalışan bilgileri yüklenemedi." onRetry={() => window.location.reload()} />
  }

  const columns: ResponsiveTableColumn<LeaveRequest>[] = [
    { key: 'leaveType', header: 'İzin Türü', primary: true, render: (row) => leaveTypeNameById.get(row.leaveTypeId) ?? '—' },
    { key: 'startDate', header: 'Başlangıç', render: (row) => row.startDate },
    { key: 'endDate', header: 'Bitiş', render: (row) => row.endDate },
    { key: 'requestedDays', header: 'Gün Sayısı', render: (row) => String(row.requestedDays) },
    {
      key: 'status',
      header: 'Durum',
      render: (row) => <StatusChip {...LEAVE_STATUS_LABELS[row.status]} />,
    },
    { key: 'rejectionReason', header: 'Ret Gerekçesi', render: (row) => row.rejectionReason ?? '—' },
  ]

  return (
    <>
      <PageHeader
        title="İzin Taleplerim"
        action={{ label: 'Yeni Talep', icon: <AddIcon />, onClick: () => navigate('/leave/requests/new') }}
      />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mb: 2, alignItems: { xs: 'stretch', md: 'center' } }}>
        <TextField
          select
          size="small"
          label="Durum"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as LeaveRequestStatus | '')}
          sx={{ minWidth: { md: 200 } }}
        >
          {STATUS_FILTER_OPTIONS.map((option) => (
            <MenuItem key={option.value || 'all'} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        {canExport && !!requests?.length && (
          <>
            <Button
              size="small"
              variant="outlined"
              startIcon={<DownloadOutlinedIcon />}
              loading={exporting}
              onClick={(event) => setExportMenuAnchor(event.currentTarget)}
            >
              Dışa Aktar
            </Button>
            <Menu anchorEl={exportMenuAnchor} open={!!exportMenuAnchor} onClose={() => setExportMenuAnchor(null)}>
              <MenuItem onClick={() => handleExport('csv')}>CSV olarak indir</MenuItem>
              <MenuItem onClick={() => handleExport('xlsx')}>Excel (XLSX) olarak indir</MenuItem>
            </Menu>
          </>
        )}
      </Stack>

      {isPending && <LoadingSkeleton rows={4} />}
      {isError && <ErrorState message="İzin talepleri yüklenemedi." onRetry={() => refetch()} />}
      {!isPending && !isError && requests?.length === 0 && (
        <EmptyState
          message="Henüz izin talebiniz yok."
          action={{ label: 'İlk Talebi Oluştur', onClick: () => navigate('/leave/requests/new') }}
        />
      )}
      {!isPending && !isError && !!requests?.length && filtered.length === 0 && (
        <EmptyState message="Bu duruma uygun izin talebi yok." />
      )}
      {!isPending && !isError && filtered.length > 0 && (
        <ResponsiveTable columns={columns} rows={filtered} getRowKey={(row) => row.id} />
      )}
    </>
  )
}
