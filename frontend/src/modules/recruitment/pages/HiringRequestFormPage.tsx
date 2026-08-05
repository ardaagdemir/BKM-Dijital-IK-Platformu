import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../../shared/api/ApiError'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { useToast } from '../../../shared/components/ToastProvider'
import { useJobTitles } from '../../organization/api/useJobTitles'
import { useUnits } from '../../organization/api/useUnits'
import { useCreateHiringRequest } from '../api/useCreateHiringRequest'
import { hiringRequestSchema, type HiringRequestFormValues } from '../schema'

// US-05.3.1: "Talep formu norm kadro kontrolü yapar; norm yoksa engellenir"
// — `leave.LeaveRequestFormPage`'in AKSİNE (bakiye yetersizse UYARIR,
// ENGELLEMEZ), burada norm YOKSA backend 404 döner ve talep GERÇEKTEN
// oluşturulmaz; frontend bu 404'ü form üstü bir hata olarak gösterir,
// kullanıcı sayfada kalır.
export function HiringRequestFormPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { data: units, isPending: isUnitsPending, isError: isUnitsError, refetch: refetchUnits } = useUnits()
  const { data: jobTitles, isPending: isJobTitlesPending, isError: isJobTitlesError, refetch: refetchJobTitles } =
    useJobTitles()
  const createHiringRequest = useCreateHiringRequest()

  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<HiringRequestFormValues>({
    resolver: zodResolver(hiringRequestSchema),
    defaultValues: { organizationUnitId: '', jobTitleId: '' },
  })

  if (isUnitsPending || isJobTitlesPending) {
    return (
      <>
        <PageHeader title="Yeni İşe Alım Talebi" />
        <LoadingSkeleton rows={4} />
      </>
    )
  }

  if (isUnitsError) {
    return <ErrorState message="Organizasyon birimleri yüklenemedi." onRetry={() => refetchUnits()} />
  }

  if (isJobTitlesError) {
    return <ErrorState message="Unvanlar yüklenemedi." onRetry={() => refetchJobTitles()} />
  }

  async function onSubmit(values: HiringRequestFormValues) {
    setSubmitError(null)
    try {
      await createHiringRequest.mutateAsync({
        organizationUnitId: Number(values.organizationUnitId),
        jobTitleId: Number(values.jobTitleId),
      })
      showToast('İşe alım talebi oluşturuldu')
      navigate('/recruitment/hiring-requests')
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.')
    }
  }

  return (
    <>
      <PageHeader title="Yeni İşe Alım Talebi" />
      <Paper sx={{ p: { xs: 2, sm: 3 }, maxWidth: 560 }}>
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
                name="organizationUnitId"
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Organizasyon Birimi"
                    fullWidth
                    error={!!errors.organizationUnitId}
                    helperText={errors.organizationUnitId?.message}
                  >
                    {(units ?? []).map((unit) => (
                      <MenuItem key={unit.id} value={String(unit.id)}>
                        {unit.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                control={control}
                name="jobTitleId"
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Unvan"
                    fullWidth
                    error={!!errors.jobTitleId}
                    helperText={errors.jobTitleId?.message}
                  >
                    {(jobTitles ?? []).map((jobTitle) => (
                      <MenuItem key={jobTitle.id} value={String(jobTitle.id)}>
                        {jobTitle.name}
                      </MenuItem>
                    ))}
                  </TextField>
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
