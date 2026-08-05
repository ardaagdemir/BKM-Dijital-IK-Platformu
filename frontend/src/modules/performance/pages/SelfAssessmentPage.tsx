import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ApiError } from '../../../shared/api/ApiError'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { useToast } from '../../../shared/components/ToastProvider'
import { useMyEmployee } from '../../organization/api/useMyEmployee'
import { useSelfAssessmentForm } from '../api/useSelfAssessmentForm'
import { useSubmitSelfAssessment } from '../api/useSubmitSelfAssessment'
import type { AssessmentItemType, AssessmentScoreRequest } from '../types'

type ScoreFormValues = Record<string, string>

function fieldName(itemType: AssessmentItemType, itemId: number): string {
  return `${itemType}-${itemId}`
}

// US-06.2.1: Öz değerlendirme formu — kabul kriteri: "Form, tanımlı hedef/
// yetkinlik setini gösterir." Kalemlerin TAMAMININ puanlanması ZORUNLU
// DEĞİL (bkz. SelfAssessmentService javadoc'u) — boş bırakılan alanlar
// gönderime DAHİL EDİLMEZ, yalnızca doldurulanlar `AssessmentScoreRequest`'e
// dönüştürülür.
export function SelfAssessmentPage() {
  const { showToast } = useToast()
  const {
    data: employee,
    isPending: isEmployeePending,
    isError: isEmployeeError,
    error: employeeError,
  } = useMyEmployee()
  const employeeMissing = isEmployeeError && employeeError instanceof ApiError && employeeError.status === 404

  const { data: form, isPending: isFormPending, isError: isFormError, error: formError } = useSelfAssessmentForm()
  const formMissing = isFormError && formError instanceof ApiError && formError.status === 404

  const submitSelfAssessment = useSubmitSelfAssessment()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ScoreFormValues>()

  if (isEmployeePending || isFormPending) {
    return (
      <>
        <PageHeader title="Öz Değerlendirme" />
        <LoadingSkeleton rows={4} />
      </>
    )
  }

  if (employeeMissing) {
    return (
      <>
        <PageHeader title="Öz Değerlendirme" />
        <EmptyState message="Sisteme bağlı bir çalışan kaydınız bulunamadı." />
      </>
    )
  }

  if (isEmployeeError || !employee) {
    return <ErrorState message="Çalışan bilgileri yüklenemedi." onRetry={() => window.location.reload()} />
  }

  if (formMissing) {
    return (
      <>
        <PageHeader title="Öz Değerlendirme" />
        <EmptyState message="Puanlama skalası henüz tanımlanmadığından değerlendirme formu kullanılamıyor." />
      </>
    )
  }

  if (isFormError || !form) {
    return <ErrorState message="Değerlendirme formu yüklenemedi." onRetry={() => window.location.reload()} />
  }

  if (form.goals.length === 0 && form.competencies.length === 0) {
    return (
      <>
        <PageHeader title="Öz Değerlendirme" />
        <EmptyState message="Henüz tanımlı bir hedef/yetkinlik yok." />
      </>
    )
  }

  async function onSubmit(values: ScoreFormValues) {
    setSubmitError(null)
    const scores: AssessmentScoreRequest[] = []
    for (const goal of form!.goals) {
      const raw = values[fieldName('GOAL', goal.id)]
      if (raw) {
        scores.push({ itemType: 'GOAL', itemId: goal.id, score: Number(raw) })
      }
    }
    for (const competency of form!.competencies) {
      const raw = values[fieldName('COMPETENCY', competency.id)]
      if (raw) {
        scores.push({ itemType: 'COMPETENCY', itemId: competency.id, score: Number(raw) })
      }
    }
    if (scores.length === 0) {
      setSubmitError('En az bir puan girilmelidir.')
      return
    }
    try {
      await submitSelfAssessment.mutateAsync({ employeeId: employee!.id, scores })
      showToast('Öz değerlendirme gönderildi')
      setSubmitted(true)
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.')
    }
  }

  if (submitted) {
    return (
      <>
        <PageHeader title="Öz Değerlendirme" />
        <EmptyState message="Öz değerlendirmeniz gönderildi. Teşekkür ederiz." />
      </>
    )
  }

  return (
    <>
      <PageHeader title="Öz Değerlendirme" />
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Puan aralığı: {form.scale.minValue}–{form.scale.maxValue}
      </Typography>
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={2.5}>
            {submitError && (
              <Grid size={12}>
                <Alert severity="error">{submitError}</Alert>
              </Grid>
            )}
            {form.goals.length > 0 && (
              <Grid size={12}>
                <Typography variant="subtitle1">Hedefler</Typography>
              </Grid>
            )}
            {form.goals.map((goal) => (
              <Grid size={{ xs: 12, sm: 6 }} key={fieldName('GOAL', goal.id)}>
                <TextField
                  {...register(fieldName('GOAL', goal.id))}
                  type="number"
                  label={goal.name}
                  fullWidth
                  slotProps={{ htmlInput: { min: form.scale.minValue, max: form.scale.maxValue } }}
                />
              </Grid>
            ))}
            {form.competencies.length > 0 && (
              <Grid size={12}>
                <Typography variant="subtitle1">Yetkinlikler</Typography>
              </Grid>
            )}
            {form.competencies.map((competency) => (
              <Grid size={{ xs: 12, sm: 6 }} key={fieldName('COMPETENCY', competency.id)}>
                <TextField
                  {...register(fieldName('COMPETENCY', competency.id))}
                  type="number"
                  label={competency.name}
                  fullWidth
                  slotProps={{ htmlInput: { min: form.scale.minValue, max: form.scale.maxValue } }}
                />
              </Grid>
            ))}
            <Grid size={12}>
              <Button type="submit" variant="contained" loading={isSubmitting} sx={{ minWidth: 160 }}>
                Gönder
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </>
  )
}
