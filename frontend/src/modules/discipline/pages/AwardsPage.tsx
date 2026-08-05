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
import { useAwards } from '../api/useAwards'
import { useCreateAward } from '../api/useCreateAward'
import { awardSchema, type AwardFormValues } from '../schema'
import type { Award } from '../types'

// US-08C.1.4: Ödül kaydı oluşturma/listeleme — `WarningsPage`'deki AYNI desen.
export function AwardsPage() {
  const { showToast } = useToast()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const { data: awards, isPending, isError, refetch } = useAwards(employee?.id)
  const createAward = useCreateAward()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AwardFormValues>({ resolver: zodResolver(awardSchema), defaultValues: { type: '', description: '' } })

  async function onSubmit(values: AwardFormValues) {
    if (!employee) {
      return
    }
    setSubmitError(null)
    try {
      await createAward.mutateAsync({ employeeId: employee.id, ...values })
      showToast('Ödül kaydı oluşturuldu')
      setDialogOpen(false)
      reset()
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.')
    }
  }

  const columns: ResponsiveTableColumn<Award>[] = [
    { key: 'type', header: 'Tür', primary: true, render: (row) => row.type },
    { key: 'description', header: 'Açıklama', render: (row) => row.description },
  ]

  return (
    <>
      <PageHeader
        title="Ödül Kayıtları"
        action={employee ? { label: 'Yeni Ödül', icon: <AddIcon />, onClick: () => setDialogOpen(true) } : undefined}
      />

      <Grid container sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <EmployeeAutocomplete label="Çalışan" value={employee} onChange={setEmployee} />
        </Grid>
      </Grid>

      {!employee && <EmptyState message="Kayıtları görüntülemek için bir çalışan seçin." />}
      {employee && isPending && <LoadingSkeleton rows={4} />}
      {employee && isError && <ErrorState message="Ödül kayıtları yüklenemedi." onRetry={() => refetch()} />}
      {employee && !isPending && !isError && awards?.length === 0 && (
        <EmptyState message="Bu çalışan için henüz bir ödül kaydı yok." />
      )}
      {employee && !isPending && !isError && !!awards?.length && (
        <ResponsiveTable columns={columns} rows={awards} getRowKey={(row) => row.id} />
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Yeni Ödül Kaydı</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 0.5 }}>
              {submitError && <Alert severity="error">{submitError}</Alert>}
              <TextField
                {...register('type')}
                label="Ödül Türü"
                autoFocus
                fullWidth
                error={!!errors.type}
                helperText={errors.type?.message}
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
