import { zodResolver } from '@hookform/resolvers/zod'
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
import { useMemo, useState } from 'react'
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
import { useCompleteEnrollment } from '../api/useCompleteEnrollment'
import { useCompletedTrainings } from '../api/useCompletedTrainings'
import { useEnrollments } from '../api/useEnrollments'
import { useTrainings } from '../api/useTrainings'
import { completeEnrollmentSchema, type CompleteEnrollmentFormValues } from '../schema'
import type { CompletedTraining, TrainingEnrollment } from '../types'

// US-08A.1.3: "İK kullanıcısı olarak, tamamlanan eğitimleri çalışan bazında
// görmek istiyorum" + `PUT .../complete` aksiyonunun UI'ı. Backend'in
// `GET /enrollments` ucu (`leave`'deki AYNI desen) `employeeId`SİZ
// çağrılamıyor (`TrainingEnrollmentService#listByEmployee` null'da
// fırlatıyor) — bu yüzden "tamamlanmayı bekleyenler" (APPROVED) listesi
// `EmployeeAutocomplete` ile TEK seferde BİR çalışan seçilerek görüntülenir;
// aşağıdaki "Tamamlanan Eğitimler" raporu ise `GET .../completed`'in
// GERÇEKTEN opsiyonel `employeeId`'siyle organizasyon geneli listelenir.
export function TrainingCompletedPage() {
  const { showToast } = useToast()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const { data: enrollments, isPending: isEnrollmentsPending, isError: isEnrollmentsError } = useEnrollments(
    employee?.id,
  )
  const { data: trainings } = useTrainings()
  const trainingNameById = useMemo(() => new Map((trainings ?? []).map((t) => [t.id, t.name])), [trainings])
  const approvedEnrollments = useMemo(() => (enrollments ?? []).filter((e) => e.status === 'APPROVED'), [enrollments])

  const completeEnrollment = useCompleteEnrollment()
  const [completeTarget, setCompleteTarget] = useState<TrainingEnrollment | null>(null)
  const [completeError, setCompleteError] = useState<string | null>(null)

  const { data: completedTrainings, isPending: isCompletedPending, isError: isCompletedError } = useCompletedTrainings()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompleteEnrollmentFormValues>({
    resolver: zodResolver(completeEnrollmentSchema),
    defaultValues: { completedDate: '' },
  })

  async function handleCompleteSubmit(values: CompleteEnrollmentFormValues) {
    if (!completeTarget) {
      return
    }
    setCompleteError(null)
    try {
      await completeEnrollment.mutateAsync({ id: completeTarget.id, completedDate: values.completedDate })
      showToast('Eğitim tamamlandı olarak işaretlendi')
      setCompleteTarget(null)
    } catch (error) {
      setCompleteError(error instanceof ApiError ? error.detail : 'İşlem başarısız, tekrar deneyin.')
    }
  }

  const pendingColumns: ResponsiveTableColumn<TrainingEnrollment>[] = [
    { key: 'training', header: 'Eğitim', primary: true, render: (row) => trainingNameById.get(row.trainingId) ?? '—' },
  ]

  const completedColumns: ResponsiveTableColumn<CompletedTraining>[] = [
    { key: 'employeeId', header: 'Çalışan (id)', primary: true, render: (row) => `#${row.employeeId}` },
    { key: 'trainingName', header: 'Eğitim', render: (row) => row.trainingName },
    { key: 'completedDate', header: 'Tamamlanma Tarihi', render: (row) => row.completedDate },
  ]

  return (
    <>
      <PageHeader title="Tamamlanan Eğitimler" />

      <Grid container sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <EmployeeAutocomplete label="Çalışan (tamamlanmayı işaretlemek için)" value={employee} onChange={setEmployee} />
        </Grid>
      </Grid>

      {employee && isEnrollmentsPending && <LoadingSkeleton rows={2} />}
      {employee && isEnrollmentsError && <ErrorState message="Eğitim talepleri yüklenemedi." />}
      {employee && !isEnrollmentsPending && !isEnrollmentsError && approvedEnrollments.length === 0 && (
        <EmptyState message="Bu çalışan için tamamlanmayı bekleyen onaylı bir eğitim talebi yok." />
      )}
      {employee && !isEnrollmentsPending && !isEnrollmentsError && approvedEnrollments.length > 0 && (
        <ResponsiveTable
          columns={pendingColumns}
          rows={approvedEnrollments}
          getRowKey={(row) => row.id}
          actions={(row) => (
            <Button
              size="small"
              onClick={() => {
                setCompleteError(null)
                setCompleteTarget(row)
              }}
            >
              Tamamlandı Olarak İşaretle
            </Button>
          )}
        />
      )}

      <Typography variant="h6" component="h2" sx={{ mt: 4, mb: 2 }}>
        Tamamlanan Eğitimler Raporu
      </Typography>
      {isCompletedPending && <LoadingSkeleton rows={4} />}
      {isCompletedError && <ErrorState message="Rapor yüklenemedi." />}
      {!isCompletedPending && !isCompletedError && completedTrainings?.length === 0 && (
        <EmptyState message="Henüz tamamlanan bir eğitim yok." />
      )}
      {!isCompletedPending && !isCompletedError && !!completedTrainings?.length && (
        <ResponsiveTable
          columns={completedColumns}
          rows={completedTrainings}
          getRowKey={(row) => `${row.employeeId}-${row.trainingId}-${row.completedDate}`}
        />
      )}

      <Dialog open={!!completeTarget} onClose={() => setCompleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Eğitimi Tamamlandı Olarak İşaretle</DialogTitle>
        <form onSubmit={handleSubmit(handleCompleteSubmit)} noValidate>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 0.5 }}>
              {completeError && <Alert severity="error">{completeError}</Alert>}
              <TextField
                {...register('completedDate')}
                type="date"
                label="Tamamlanma Tarihi"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                error={!!errors.completedDate}
                helperText={errors.completedDate?.message}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCompleteTarget(null)} disabled={isSubmitting}>
              Vazgeç
            </Button>
            <Button type="submit" variant="contained" loading={isSubmitting}>
              Kaydet
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}
