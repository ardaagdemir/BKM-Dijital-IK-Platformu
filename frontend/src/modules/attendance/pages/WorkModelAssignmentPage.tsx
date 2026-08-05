import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { ApiError } from '../../../shared/api/ApiError'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { useToast } from '../../../shared/components/ToastProvider'
import * as organizationApi from '../../organization/api/organizationApi'
import { useAssignWorkModel } from '../api/useAssignWorkModel'
import { useWorkModelAssignment } from '../api/useWorkModelAssignment'
import { useWorkModels } from '../api/useWorkModels'
import { workModelAssignmentSchema, type WorkModelAssignmentFormValues } from '../schema'

// US-07.1.2: Çalışana çalışma modeli atama — `organization.EmployeeDetailPage`'den
// (14.2'nin "Atama" bölümüyle AYNI kategoride ama AYRI bir route/sayfa,
// çünkü `attendance` `organization`'a bağımlı DEĞİL, bkz. backend'in
// WorkModelAssignmentController javadoc'u) bir bağlantıyla ulaşılır.
export function WorkModelAssignmentPage() {
  const { id } = useParams<{ id: string }>()
  const employeeId = Number(id)
  const { showToast } = useToast()

  const { data: employee, isPending: isEmployeePending, isError: isEmployeeError } = useQuery({
    queryKey: ['organization', 'employees', employeeId],
    queryFn: () => organizationApi.getEmployee(employeeId),
  })
  const { data: workModels, isPending: isWorkModelsPending, isError: isWorkModelsError } = useWorkModels()
  const { data: assignment, isPending: isAssignmentPending } = useWorkModelAssignment(employeeId)
  const assignWorkModel = useAssignWorkModel()

  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WorkModelAssignmentFormValues>({
    resolver: zodResolver(workModelAssignmentSchema),
    defaultValues: { workModelId: '' },
  })

  useEffect(() => {
    if (assignment) {
      reset({ workModelId: String(assignment.workModelId) })
    }
  }, [assignment, reset])

  async function onSubmit(values: WorkModelAssignmentFormValues) {
    setSubmitError(null)
    try {
      await assignWorkModel.mutateAsync({ employeeId, workModelId: Number(values.workModelId) })
      showToast('Çalışma modeli atandı')
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.')
    }
  }

  const title = employee ? `${employee.firstName} ${employee.lastName} — Çalışma Modeli` : 'Çalışma Modeli'

  if (isEmployeePending || isWorkModelsPending || isAssignmentPending) {
    return (
      <>
        <PageHeader title={title} />
        <LoadingSkeleton rows={2} />
      </>
    )
  }

  if (isEmployeeError) {
    return <ErrorState message="Çalışan bulunamadı." onRetry={() => window.location.reload()} />
  }

  if (isWorkModelsError) {
    return <ErrorState message="Çalışma modelleri yüklenemedi." onRetry={() => window.location.reload()} />
  }

  return (
    <>
      <PageHeader title={title} />
      <Paper sx={{ p: { xs: 2, sm: 3 }, maxWidth: 480 }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={2.5}>
            {submitError && (
              <Grid size={12}>
                <Alert severity="error">{submitError}</Alert>
              </Grid>
            )}
            <Grid size={12}>
              <Controller
                control={control}
                name="workModelId"
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Çalışma Modeli"
                    fullWidth
                    error={!!errors.workModelId}
                    helperText={errors.workModelId?.message}
                  >
                    {(workModels ?? []).map((workModel) => (
                      <MenuItem key={workModel.id} value={String(workModel.id)}>
                        {workModel.name} ({workModel.plannedStartTime.slice(0, 5)}–{workModel.plannedEndTime.slice(0, 5)})
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={12}>
              <Button type="submit" variant="contained" loading={isSubmitting} sx={{ minWidth: 160 }}>
                Ata
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </>
  )
}
