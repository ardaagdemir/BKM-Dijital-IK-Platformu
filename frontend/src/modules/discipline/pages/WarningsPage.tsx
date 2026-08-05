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
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ApiError } from '../../../shared/api/ApiError'
import { EmployeeAutocomplete } from '../../../shared/components/EmployeeAutocomplete'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../../shared/components/ResponsiveTable'
import { useToast } from '../../../shared/components/ToastProvider'
import type { Employee } from '../../organization/types'
import { useCreateWarning } from '../api/useCreateWarning'
import { useWarnings } from '../api/useWarnings'
import { warningSchema, type WarningFormValues } from '../schema'
import type { Warning } from '../types'

// US-08C.1.1: Uyarı kaydı oluşturma/listeleme — `attendance.AttendanceRecordsPage`'deki
// AYNI "EmployeeAutocomplete ile çalışan seç, o çalışanın kayıtlarını
// yönet" deseni.
export function WarningsPage() {
  const { showToast } = useToast()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const { data: warnings, isPending, isError, refetch } = useWarnings(employee?.id)
  const createWarning = useCreateWarning()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WarningFormValues>({
    resolver: zodResolver(warningSchema),
    defaultValues: { date: '', reason: '', description: '' },
  })

  async function onSubmit(values: WarningFormValues) {
    if (!employee) {
      return
    }
    setSubmitError(null)
    try {
      await createWarning.mutateAsync({ employeeId: employee.id, ...values })
      showToast('Uyarı kaydı oluşturuldu')
      setDialogOpen(false)
      reset()
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.')
    }
  }

  const columns: ResponsiveTableColumn<Warning>[] = [
    { key: 'date', header: 'Tarih', primary: true, render: (row) => row.date },
    { key: 'reason', header: 'Sebep', render: (row) => row.reason },
    { key: 'description', header: 'Açıklama', render: (row) => row.description },
  ]

  return (
    <>
      <PageHeader
        title="Uyarı Kayıtları"
        action={employee ? { label: 'Yeni Uyarı', icon: <AddIcon />, onClick: () => setDialogOpen(true) } : undefined}
      />

      <Grid container sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <EmployeeAutocomplete label="Çalışan" value={employee} onChange={setEmployee} />
        </Grid>
      </Grid>

      {!employee && <EmptyState message="Kayıtları görüntülemek için bir çalışan seçin." />}
      {employee && isPending && <LoadingSkeleton rows={4} />}
      {employee && isError && <ErrorState message="Uyarı kayıtları yüklenemedi." onRetry={() => refetch()} />}
      {employee && !isPending && !isError && warnings?.length === 0 && (
        <EmptyState message="Bu çalışan için henüz bir uyarı kaydı yok." />
      )}
      {employee && !isPending && !isError && !!warnings?.length && (
        <ResponsiveTable columns={columns} rows={warnings} getRowKey={(row) => row.id} />
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Yeni Uyarı Kaydı</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 0.5 }}>
              {submitError && <Alert severity="error">{submitError}</Alert>}
              <TextField
                {...register('date')}
                type="date"
                label="Tarih"
                autoFocus
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                error={!!errors.date}
                helperText={errors.date?.message}
              />
              <TextField
                {...register('reason')}
                label="Sebep"
                fullWidth
                error={!!errors.reason}
                helperText={errors.reason?.message}
              />
              <TextField
                {...register('description')}
                label="Açıklama"
                fullWidth
                multiline
                rows={3}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
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
