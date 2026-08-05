import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { ApiError } from '../../../shared/api/ApiError'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../../shared/components/ResponsiveTable'
import { StatusChip } from '../../../shared/components/StatusChip'
import { useToast } from '../../../shared/components/ToastProvider'
import { useMyEmployee } from '../../organization/api/useMyEmployee'
import { useCreateEnrollment } from '../api/useCreateEnrollment'
import { useEnrollments } from '../api/useEnrollments'
import { useTrainings } from '../api/useTrainings'
import { TRAINING_ENROLLMENT_STATUS_LABELS } from '../statusLabels'
import type { TrainingEnrollment } from '../types'

const requestSchema = z.object({ trainingId: z.string().min(1, 'Eğitim seçilmelidir.') })
type RequestFormValues = z.infer<typeof requestSchema>

// US-08A.1.2: "Çalışan olarak, katalogdan eğitim talep etmek istiyorum" —
// `leave.LeaveRequestsPage`'deki AYNI "kendi listem" + `LeaveRequestFormPage`'deki
// AYNI "talep oluştur" desenlerinin TEK sayfada birleşimi (roadmap'in kendi
// "my-trainings (talep + tamamlananlar)" tanımı zaten TEK ekran istiyor).
export function MyTrainingsPage() {
  const { showToast } = useToast()
  const {
    data: employee,
    isPending: isEmployeePending,
    isError: isEmployeeError,
    error: employeeError,
  } = useMyEmployee()
  const employeeMissing = isEmployeeError && employeeError instanceof ApiError && employeeError.status === 404

  const { data: trainings, isPending: isTrainingsPending } = useTrainings()
  const trainingNameById = useMemo(() => new Map((trainings ?? []).map((t) => [t.id, t.name])), [trainings])

  const { data: enrollments, isPending: isEnrollmentsPending, isError: isEnrollmentsError, refetch } = useEnrollments(
    employee?.id,
  )
  const createEnrollment = useCreateEnrollment()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RequestFormValues>({ resolver: zodResolver(requestSchema), defaultValues: { trainingId: '' } })

  if (isEmployeePending || isTrainingsPending) {
    return (
      <>
        <PageHeader title="Eğitimlerim" />
        <LoadingSkeleton rows={4} />
      </>
    )
  }

  if (employeeMissing) {
    return (
      <>
        <PageHeader title="Eğitimlerim" />
        <EmptyState message="Sisteme bağlı bir çalışan kaydınız bulunamadı." />
      </>
    )
  }

  if (isEmployeeError || !employee) {
    return <ErrorState message="Çalışan bilgileri yüklenemedi." onRetry={() => window.location.reload()} />
  }

  async function onSubmit(values: RequestFormValues) {
    setSubmitError(null)
    try {
      await createEnrollment.mutateAsync({ employeeId: employee!.id, trainingId: Number(values.trainingId) })
      showToast('Eğitim talebi oluşturuldu')
      reset({ trainingId: '' })
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.')
    }
  }

  const columns: ResponsiveTableColumn<TrainingEnrollment>[] = [
    { key: 'training', header: 'Eğitim', primary: true, render: (row) => trainingNameById.get(row.trainingId) ?? '—' },
    { key: 'status', header: 'Durum', render: (row) => <StatusChip {...TRAINING_ENROLLMENT_STATUS_LABELS[row.status]} /> },
    {
      key: 'detail',
      header: 'Ayrıntı',
      render: (row) =>
        row.status === 'REJECTED'
          ? (row.rejectionReason ?? '—')
          : row.status === 'COMPLETED'
            ? row.completedDate
            : '—',
    },
  ]

  return (
    <>
      <PageHeader title="Eğitimlerim" />
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Yeni Eğitim Talebi
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <Controller
              control={control}
              name="trainingId"
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Eğitim"
                  fullWidth
                  error={!!errors.trainingId}
                  helperText={errors.trainingId?.message}
                >
                  {(trainings ?? []).map((training) => (
                    <MenuItem key={training.id} value={String(training.id)}>
                      {training.name} ({training.provider})
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Button type="submit" variant="contained" loading={isSubmitting} sx={{ minWidth: 160 }}>
              Talep Et
            </Button>
          </Stack>
        </form>
      </Paper>

      {isEnrollmentsPending && <LoadingSkeleton rows={3} />}
      {isEnrollmentsError && <ErrorState message="Eğitim taleplerim yüklenemedi." onRetry={() => refetch()} />}
      {!isEnrollmentsPending && !isEnrollmentsError && enrollments?.length === 0 && (
        <EmptyState message="Henüz bir eğitim talebiniz yok." />
      )}
      {!isEnrollmentsPending && !isEnrollmentsError && !!enrollments?.length && (
        <ResponsiveTable columns={columns} rows={enrollments} getRowKey={(row) => row.id} />
      )}
    </>
  )
}
