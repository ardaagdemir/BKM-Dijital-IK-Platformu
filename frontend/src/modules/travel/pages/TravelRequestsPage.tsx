import { zodResolver } from '@hookform/resolvers/zod'
import AddIcon from '@mui/icons-material/Add'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../../shared/api/ApiError'
import { EmployeeAutocomplete } from '../../../shared/components/EmployeeAutocomplete'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../../shared/components/ResponsiveTable'
import { useToast } from '../../../shared/components/ToastProvider'
import { useAuth } from '../../auth/AuthProvider'
import { useMyEmployee } from '../../organization/api/useMyEmployee'
import type { Employee } from '../../organization/types'
import { useCreateTravelRequest } from '../api/useCreateTravelRequest'
import { useTravelRequests } from '../api/useTravelRequests'
import { travelRequestSchema, type TravelRequestFormValues } from '../schema'
import type { TravelRequest } from '../types'

// US-08B.1.1: "Form kaydedilir" + liste — `attendance.TimesheetPage`'deki
// AYNI "kendim + ADMIN/IK/YONETICI için EmployeeAutocomplete ile başkasını
// gözlemleme" deseni; buradaki fark, "başkasını gözlemleme" YALNIZCA
// GÖRÜNTÜLEME amaçlı (talep oluşturma HER ZAMAN kendi adına).
export function TravelRequestsPage() {
  const { user } = useAuth()
  const canBrowseOthers = !!user?.roles.some((role) => role === 'ADMIN' || role === 'IK' || role === 'YONETICI')
  const { showToast } = useToast()

  const {
    data: myEmployee,
    isPending: isMyEmployeePending,
    isError: isMyEmployeeError,
    error: myEmployeeError,
  } = useMyEmployee()
  const employeeMissing = isMyEmployeeError && myEmployeeError instanceof ApiError && myEmployeeError.status === 404

  const [browsedEmployee, setBrowsedEmployee] = useState<Employee | null>(null)
  const viewedEmployeeId = browsedEmployee?.id ?? myEmployee?.id
  const isOwnList = !browsedEmployee

  const { data: requests, isPending: isRequestsPending, isError: isRequestsError, refetch } = useTravelRequests(
    viewedEmployeeId,
  )
  const createTravelRequest = useCreateTravelRequest()
  const navigate = useNavigate()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TravelRequestFormValues>({
    resolver: zodResolver(travelRequestSchema),
    defaultValues: { location: '', startDate: '', endDate: '', purpose: '' },
  })

  async function onSubmit(values: TravelRequestFormValues) {
    setSubmitError(null)
    try {
      await createTravelRequest.mutateAsync({ employeeId: myEmployee!.id, ...values })
      showToast('Seyahat talebi oluşturuldu')
      setDialogOpen(false)
      reset()
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.')
    }
  }

  if (isMyEmployeePending) {
    return (
      <>
        <PageHeader title="Seyahat Talepleri" />
        <LoadingSkeleton rows={4} />
      </>
    )
  }

  if (employeeMissing) {
    return (
      <>
        <PageHeader title="Seyahat Talepleri" />
        <EmptyState message="Sisteme bağlı bir çalışan kaydınız bulunamadı." />
      </>
    )
  }

  if (isMyEmployeeError || !myEmployee) {
    return <ErrorState message="Çalışan bilgileri yüklenemedi." onRetry={() => window.location.reload()} />
  }

  const columns: ResponsiveTableColumn<TravelRequest>[] = [
    { key: 'location', header: 'Lokasyon', primary: true, render: (row) => row.location },
    { key: 'startDate', header: 'Başlangıç', render: (row) => row.startDate },
    { key: 'endDate', header: 'Bitiş', render: (row) => row.endDate },
    { key: 'purpose', header: 'Amaç', render: (row) => row.purpose },
  ]

  return (
    <>
      <PageHeader
        title={isOwnList ? 'Seyahat Taleplerim' : `${browsedEmployee?.firstName} ${browsedEmployee?.lastName} — Seyahat Talepleri`}
        action={{ label: 'Yeni Talep', icon: <AddIcon />, onClick: () => setDialogOpen(true) }}
      />

      {canBrowseOthers && (
        <Grid container sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <EmployeeAutocomplete label="Başka bir çalışanı görüntüle" value={browsedEmployee} onChange={setBrowsedEmployee} />
          </Grid>
        </Grid>
      )}

      {isRequestsPending && <LoadingSkeleton rows={4} />}
      {isRequestsError && <ErrorState message="Seyahat talepleri yüklenemedi." onRetry={() => refetch()} />}
      {!isRequestsPending && !isRequestsError && requests?.length === 0 && (
        <EmptyState message="Henüz bir seyahat talebi yok." />
      )}
      {!isRequestsPending && !isRequestsError && !!requests?.length && (
        <ResponsiveTable
          columns={columns}
          rows={requests}
          getRowKey={(row) => row.id}
          onRowClick={(row) => navigate(`/travel/requests/${row.id}`)}
        />
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Yeni Seyahat Talebi</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 0.5 }}>
              {submitError && <Alert severity="error">{submitError}</Alert>}
              <TextField
                {...register('location')}
                label="Lokasyon"
                autoFocus
                fullWidth
                error={!!errors.location}
                helperText={errors.location?.message}
              />
              <TextField
                {...register('startDate')}
                type="date"
                label="Başlangıç Tarihi"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                error={!!errors.startDate}
                helperText={errors.startDate?.message}
              />
              <TextField
                {...register('endDate')}
                type="date"
                label="Bitiş Tarihi"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                error={!!errors.endDate}
                helperText={errors.endDate?.message}
              />
              <TextField
                {...register('purpose')}
                label="Amaç"
                fullWidth
                multiline
                rows={2}
                error={!!errors.purpose}
                helperText={errors.purpose?.message}
              />
              <Typography variant="caption" color="text.secondary">
                Talep, hesabınızdaki çalışan kaydı adına oluşturulur.
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
              Vazgeç
            </Button>
            <Button type="submit" variant="contained" loading={isSubmitting}>
              Oluştur
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}
