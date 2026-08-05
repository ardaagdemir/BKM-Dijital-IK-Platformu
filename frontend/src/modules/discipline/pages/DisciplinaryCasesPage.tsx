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
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../../shared/api/ApiError'
import { EmployeeAutocomplete } from '../../../shared/components/EmployeeAutocomplete'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../../shared/components/ResponsiveTable'
import { StatusChip } from '../../../shared/components/StatusChip'
import { useToast } from '../../../shared/components/ToastProvider'
import type { Employee } from '../../organization/types'
import { useCreateDisciplinaryCase } from '../api/useCreateDisciplinaryCase'
import { useDisciplinaryCases } from '../api/useDisciplinaryCases'
import { disciplinaryCaseSchema, type DisciplinaryCaseFormValues } from '../schema'
import { DISCIPLINARY_CASE_STATUS_LABELS } from '../statusLabels'
import type { DisciplinaryCase } from '../types'

// US-08C.1.2: Ceza süreci listesi + açma — `WarningsPage`'deki AYNI
// "EmployeeAutocomplete ile çalışan seç" deseni; her satır tıklanınca
// `DisciplinaryCaseDetailPage`'e (savunma/kapatma/revizyon geçmişi) gider.
export function DisciplinaryCasesPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const { data: cases, isPending, isError, refetch } = useDisciplinaryCases(employee?.id)
  const createCase = useCreateDisciplinaryCase()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DisciplinaryCaseFormValues>({ resolver: zodResolver(disciplinaryCaseSchema), defaultValues: { reason: '' } })

  async function onSubmit(values: DisciplinaryCaseFormValues) {
    if (!employee) {
      return
    }
    setSubmitError(null)
    try {
      const created = await createCase.mutateAsync({ employeeId: employee.id, reason: values.reason })
      showToast('Ceza süreci açıldı')
      setDialogOpen(false)
      reset()
      navigate(`/discipline/cases/${created.id}`)
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.')
    }
  }

  const columns: ResponsiveTableColumn<DisciplinaryCase>[] = [
    { key: 'reason', header: 'Gerekçe', primary: true, render: (row) => row.reason },
    { key: 'status', header: 'Durum', render: (row) => <StatusChip {...DISCIPLINARY_CASE_STATUS_LABELS[row.status]} /> },
  ]

  return (
    <>
      <PageHeader
        title="Ceza Süreçleri"
        action={employee ? { label: 'Yeni Süreç Aç', icon: <AddIcon />, onClick: () => setDialogOpen(true) } : undefined}
      />

      <Grid container sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <EmployeeAutocomplete label="Çalışan" value={employee} onChange={setEmployee} />
        </Grid>
      </Grid>

      {!employee && <EmptyState message="Süreçleri görüntülemek için bir çalışan seçin." />}
      {employee && isPending && <LoadingSkeleton rows={4} />}
      {employee && isError && <ErrorState message="Ceza süreçleri yüklenemedi." onRetry={() => refetch()} />}
      {employee && !isPending && !isError && cases?.length === 0 && (
        <EmptyState message="Bu çalışan için henüz bir ceza süreci yok." />
      )}
      {employee && !isPending && !isError && !!cases?.length && (
        <ResponsiveTable
          columns={columns}
          rows={cases}
          getRowKey={(row) => row.id}
          onRowClick={(row) => navigate(`/discipline/cases/${row.id}`)}
        />
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Yeni Ceza Süreci</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 0.5 }}>
              {submitError && <Alert severity="error">{submitError}</Alert>}
              <TextField
                {...register('reason')}
                label="Gerekçe"
                autoFocus
                fullWidth
                multiline
                rows={2}
                error={!!errors.reason}
                helperText={errors.reason?.message}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
              Vazgeç
            </Button>
            <Button type="submit" variant="contained" loading={isSubmitting}>
              Aç
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}
