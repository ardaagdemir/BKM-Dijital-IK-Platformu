import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../../shared/api/ApiError'
import { PageHeader } from '../../../shared/components/PageHeader'
import { useToast } from '../../../shared/components/ToastProvider'
import { useCreateEmployee } from '../api/useCreateEmployee'
import { employeeSchema, type EmployeeFormValues } from '../schema'

// Bölüm 8: backend'in TEK-alanlı hata kısıtı — ProblemDetail.detail hangi
// ALANLA ilgili olduğunu belirtmez. Backend'in SABİT/bilinen mesaj
// metinleriyle BİREBİR eşleştirme MÜMKÜN olduğundan burada kullanılır;
// eşleşme yoksa yalnızca banner gösterilir (GARANTİ olan budur).
const FIELD_ERROR_MESSAGES: Partial<Record<string, keyof EmployeeFormValues>> = {
  'Ad boş olamaz.': 'firstName',
  'Soyad boş olamaz.': 'lastName',
  'E-posta boş olamaz.': 'email',
  'İşe giriş tarihi boş olamaz.': 'hireDate',
  'TC Kimlik No geçersiz.': 'nationalId',
}

export function EmployeeCreatePage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const createEmployee = useCreateEmployee()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { firstName: '', lastName: '', nationalId: '', hireDate: '', email: '' },
  })

  async function onSubmit(values: EmployeeFormValues) {
    setSubmitError(null)
    try {
      const employee = await createEmployee.mutateAsync(values)
      showToast('Çalışan oluşturuldu')
      navigate(`/organization/employees/${employee.id}`, { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.detail)
        const field = FIELD_ERROR_MESSAGES[error.detail]
        if (field) {
          setError(field, { type: 'server', message: error.detail })
        }
      } else {
        setSubmitError('Beklenmeyen bir hata oluştu, tekrar deneyin.')
      }
    }
  }

  return (
    <>
      <PageHeader title="Yeni Çalışan" />
      <Paper sx={{ p: { xs: 2, sm: 3 }, maxWidth: 720 }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={2.5}>
            {submitError && (
              <Grid size={12}>
                <Alert severity="error">{submitError}</Alert>
              </Grid>
            )}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                {...register('firstName')}
                label="Ad"
                fullWidth
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                {...register('lastName')}
                label="Soyad"
                fullWidth
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                {...register('nationalId')}
                label="TC Kimlik No"
                fullWidth
                error={!!errors.nationalId}
                helperText={errors.nationalId?.message}
                slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 11 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                control={control}
                name="hireDate"
                render={({ field, fieldState }) => (
                  <DatePicker
                    label="İşe Giriş Tarihi"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(date) => field.onChange(date?.isValid() ? date.format('YYYY-MM-DD') : '')}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!fieldState.error,
                        helperText: fieldState.error?.message,
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                {...register('email')}
                label="E-posta"
                type="email"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </Grid>
            <Grid size={12}>
              <Button type="submit" variant="contained" loading={isSubmitting} sx={{ minWidth: 160 }}>
                Oluştur
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </>
  )
}
