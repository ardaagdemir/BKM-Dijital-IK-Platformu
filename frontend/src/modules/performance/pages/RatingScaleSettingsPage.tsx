import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ApiError } from '../../../shared/api/ApiError'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { useToast } from '../../../shared/components/ToastProvider'
import { useAssessmentWeightConfig } from '../api/useAssessmentWeightConfig'
import { useRatingScale } from '../api/useRatingScale'
import { useSetAssessmentWeightConfig } from '../api/useSetAssessmentWeightConfig'
import { useSetRatingScale } from '../api/useSetRatingScale'
import {
  assessmentWeightConfigSchema,
  ratingScaleSchema,
  type AssessmentWeightConfigFormValues,
  type RatingScaleFormValues,
} from '../schema'

// US-06.1.2 (Puanlama Skalası) + US-06.2.3 ("Ağırlıklar parametrik" — nihai
// not ağırlıklandırması). Roadmap'in 14.5 rota tablosu yalnızca
// `/performance/rating-scale`'i listeliyor ama US-06.2.3'ün kabul kriteri
// AÇIKÇA parametrik bir ağırlıklandırma İSTİYOR — backend'de zaten
// (`AssessmentWeightConfigController`) VAR, frontend'de KENDİ rotası
// icat edilmek yerine AYNI "sistem geneli tekil ayar" sayfasına İKİNCİ
// bölüm olarak eklendi (her ikisi de ADMIN/IK, `PUT` upsert semantiği).
export function RatingScaleSettingsPage() {
  return (
    <>
      <PageHeader title="Puanlama ve Ağırlıklandırma" />
      <Stack spacing={3}>
        <RatingScaleSection />
        <AssessmentWeightConfigSection />
      </Stack>
    </>
  )
}

function RatingScaleSection() {
  const { data: scale, isPending } = useRatingScale()
  const setRatingScale = useSetRatingScale()
  const { showToast } = useToast()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RatingScaleFormValues>({
    resolver: zodResolver(ratingScaleSchema),
    defaultValues: { minValue: '', maxValue: '' },
  })

  useEffect(() => {
    if (scale) {
      reset({ minValue: String(scale.minValue), maxValue: String(scale.maxValue) })
    }
  }, [scale, reset])

  async function onSubmit(values: RatingScaleFormValues) {
    setSubmitError(null)
    try {
      await setRatingScale.mutateAsync({ minValue: Number(values.minValue), maxValue: Number(values.maxValue) })
      showToast('Puanlama skalası kaydedildi')
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.')
    }
  }

  if (isPending) {
    return (
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <LoadingSkeleton rows={2} />
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
        Puanlama Skalası
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={2.5}>
          {submitError && (
            <Grid size={12}>
              <Alert severity="error">{submitError}</Alert>
            </Grid>
          )}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              {...register('minValue')}
              type="number"
              label="Alt Sınır"
              fullWidth
              error={!!errors.minValue}
              helperText={errors.minValue?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              {...register('maxValue')}
              type="number"
              label="Üst Sınır"
              fullWidth
              error={!!errors.maxValue}
              helperText={errors.maxValue?.message}
            />
          </Grid>
          <Grid size={12}>
            <Button type="submit" variant="contained" loading={isSubmitting}>
              Kaydet
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  )
}

function AssessmentWeightConfigSection() {
  const { data: config, isPending } = useAssessmentWeightConfig()
  const setConfig = useSetAssessmentWeightConfig()
  const { showToast } = useToast()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AssessmentWeightConfigFormValues>({
    resolver: zodResolver(assessmentWeightConfigSchema),
    defaultValues: { goalWeight: '', competencyWeight: '' },
  })

  useEffect(() => {
    if (config) {
      reset({ goalWeight: String(config.goalWeight), competencyWeight: String(config.competencyWeight) })
    }
  }, [config, reset])

  async function onSubmit(values: AssessmentWeightConfigFormValues) {
    setSubmitError(null)
    try {
      await setConfig.mutateAsync({
        goalWeight: Number(values.goalWeight),
        competencyWeight: Number(values.competencyWeight),
      })
      showToast('Nihai not ağırlıklandırması kaydedildi')
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.')
    }
  }

  if (isPending) {
    return (
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <LoadingSkeleton rows={2} />
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
        Nihai Not Ağırlıklandırması
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={2.5}>
          {submitError && (
            <Grid size={12}>
              <Alert severity="error">{submitError}</Alert>
            </Grid>
          )}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              {...register('goalWeight')}
              type="number"
              label="Hedef Ağırlığı (%)"
              fullWidth
              error={!!errors.goalWeight}
              helperText={errors.goalWeight?.message}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              {...register('competencyWeight')}
              type="number"
              label="Yetkinlik Ağırlığı (%)"
              fullWidth
              error={!!errors.competencyWeight}
              helperText={errors.competencyWeight?.message}
            />
          </Grid>
          <Grid size={12}>
            <Button type="submit" variant="contained" loading={isSubmitting}>
              Kaydet
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  )
}
