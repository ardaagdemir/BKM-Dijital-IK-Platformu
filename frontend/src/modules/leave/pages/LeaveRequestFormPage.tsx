import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../../shared/api/ApiError'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { useToast } from '../../../shared/components/ToastProvider'
import { useMyEmployee } from '../../organization/api/useMyEmployee'
import { useCreateLeaveRequest } from '../api/useCreateLeaveRequest'
import { useLeaveTypes } from '../api/useLeaveTypes'
import { createLeaveRequestSchema, type CreateLeaveRequestFormValues } from '../schema'

// US-04.2.1: "bakiye yetersizse UYARI gösterilir, ENGELLENMEZ" — bu yüzden
// `balanceWarning` dönerse talep YİNE DE oluşturulmuş sayılır (banner
// `warning` renginde, hata DEĞİL) ve kullanıcı isterse Taleplerim'e geçer.
export function LeaveRequestFormPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { data: employee, isPending: isEmployeePending, isError: isEmployeeError, error: employeeError } = useMyEmployee()
  const { data: leaveTypes, isPending: isTypesPending, isError: isTypesError, refetch: refetchTypes } = useLeaveTypes()
  const createLeaveRequest = useCreateLeaveRequest()

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [balanceWarning, setBalanceWarning] = useState<string | null>(null)

  const employeeMissing = isEmployeeError && employeeError instanceof ApiError && employeeError.status === 404

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateLeaveRequestFormValues>({
    resolver: zodResolver(createLeaveRequestSchema),
    defaultValues: { leaveTypeId: '', startDate: '', endDate: '' },
  })

  if (isEmployeePending || isTypesPending) {
    return (
      <>
        <PageHeader title="Yeni İzin Talebi" />
        <LoadingSkeleton rows={4} />
      </>
    )
  }

  if (employeeMissing) {
    return (
      <>
        <PageHeader title="Yeni İzin Talebi" />
        <EmptyState message="Sisteme bağlı bir çalışan kaydınız bulunamadı." />
      </>
    )
  }

  if (isEmployeeError || !employee) {
    return <ErrorState message="Çalışan bilgileri yüklenemedi." onRetry={() => window.location.reload()} />
  }

  if (isTypesError) {
    return <ErrorState message="İzin türleri yüklenemedi." onRetry={() => refetchTypes()} />
  }

  async function onSubmit(values: CreateLeaveRequestFormValues) {
    setSubmitError(null)
    setBalanceWarning(null)
    try {
      const created = await createLeaveRequest.mutateAsync({
        request: {
          employeeId: employee!.id,
          leaveTypeId: Number(values.leaveTypeId),
          startDate: values.startDate,
          endDate: values.endDate,
        },
        options: { hireDate: employee!.hireDate, employeeEmail: employee!.email },
      })
      if (created.balanceWarning) {
        showToast('Talep oluşturuldu (bakiye uyarısıyla)', 'warning')
        setBalanceWarning(created.balanceWarning)
      } else {
        showToast('İzin talebi oluşturuldu')
        navigate('/leave/requests')
      }
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.')
    }
  }

  return (
    <>
      <PageHeader title="Yeni İzin Talebi" />
      <Paper sx={{ p: { xs: 2, sm: 3 }, maxWidth: 560 }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={2.5}>
            {submitError && (
              <Grid size={12}>
                <Alert severity="error">{submitError}</Alert>
              </Grid>
            )}
            {balanceWarning && (
              <Grid size={12}>
                <Alert severity="warning">{balanceWarning}</Alert>
                <Button size="small" sx={{ mt: 1 }} onClick={() => navigate('/leave/requests')}>
                  Taleplerime Git
                </Button>
              </Grid>
            )}
            <Grid size={12}>
              <Controller
                control={control}
                name="leaveTypeId"
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="İzin Türü"
                    fullWidth
                    error={!!errors.leaveTypeId}
                    helperText={errors.leaveTypeId?.message}
                  >
                    {(leaveTypes ?? []).map((leaveType) => (
                      <MenuItem key={leaveType.id} value={String(leaveType.id)}>
                        {leaveType.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                control={control}
                name="startDate"
                render={({ field, fieldState }) => (
                  <DatePicker
                    label="Başlangıç"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(date) => field.onChange(date?.isValid() ? date.format('YYYY-MM-DD') : '')}
                    slotProps={{
                      textField: { fullWidth: true, error: !!fieldState.error, helperText: fieldState.error?.message },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                control={control}
                name="endDate"
                render={({ field, fieldState }) => (
                  <DatePicker
                    label="Bitiş"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(date) => field.onChange(date?.isValid() ? date.format('YYYY-MM-DD') : '')}
                    slotProps={{
                      textField: { fullWidth: true, error: !!fieldState.error, helperText: fieldState.error?.message },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={12}>
              <Button type="submit" variant="contained" loading={isSubmitting} sx={{ minWidth: 160 }}>
                Talep Oluştur
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </>
  )
}
