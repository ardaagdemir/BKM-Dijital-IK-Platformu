import { useQuery } from '@tanstack/react-query'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../../shared/api/ApiError'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { useToast } from '../../../shared/components/ToastProvider'
import * as organizationApi from '../../organization/api/organizationApi'
import { useMyEmployee } from '../../organization/api/useMyEmployee'
import { useSelfAssessmentForm } from '../api/useSelfAssessmentForm'
import { useSubmitManagerAssessment } from '../api/useSubmitManagerAssessment'
import type { AssessmentItemType, AssessmentScoreRequest } from '../types'

type ScoreFormValues = Record<string, string> & { period: string }

function fieldName(itemType: AssessmentItemType, itemId: number): string {
  return `${itemType}-${itemId}`
}

// US-06.2.2: Yönetici değerlendirmesi — "yönetici yalnızca kendi ekibini
// değerlendirebilir" `leave.LeaveApprovalsPage`'deki AYNI "kendi birimim =
// ekibim" istemci taraflı çözümlemesiyle uygulanır (bkz. o sayfadaki
// ayrıntılı not); form ALANLARI `SelfAssessmentPage`'le AYNI (backend'in
// TEK bir hedef/yetkinlik/skala kaynağı paylaşılır), tek fark: dönem alanı
// + hedef seçilen çalışan.
export function TeamAssessmentsPage() {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const {
    data: myEmployee,
    isPending: isMyEmployeePending,
    isError: isMyEmployeeError,
    error: myEmployeeError,
  } = useMyEmployee()
  const employeeMissing = isMyEmployeeError && myEmployeeError instanceof ApiError && myEmployeeError.status === 404
  const organizationUnitId = myEmployee?.organizationUnitId ?? undefined

  const {
    data: teamPage,
    isPending: isTeamPending,
    isError: isTeamError,
    refetch: refetchTeam,
  } = useQuery({
    queryKey: ['performance', 'teamAssessments', 'team', organizationUnitId],
    queryFn: () => organizationApi.searchEmployees({ organizationUnitId, page: 0, size: 100 }),
    enabled: !!organizationUnitId,
  })
  const teamMembers = useMemo(
    () => (teamPage?.content ?? []).filter((member) => member.id !== myEmployee?.id),
    [teamPage, myEmployee],
  )
  const teamEmployeeIds = useMemo(() => teamMembers.map((member) => member.id), [teamMembers])

  const { data: form, isPending: isFormPending, isError: isFormError, error: formError } = useSelfAssessmentForm()
  const formMissing = isFormError && formError instanceof ApiError && formError.status === 404

  const submitManagerAssessment = useSubmitManagerAssessment()
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ScoreFormValues>({ defaultValues: { period: '' } })

  if (isMyEmployeePending) {
    return (
      <>
        <PageHeader title="Ekip Değerlendirmeleri" />
        <LoadingSkeleton rows={4} />
      </>
    )
  }

  if (employeeMissing) {
    return (
      <>
        <PageHeader title="Ekip Değerlendirmeleri" />
        <EmptyState message="Sisteme bağlı bir çalışan kaydınız bulunamadı." />
      </>
    )
  }

  if (isMyEmployeeError || !myEmployee) {
    return <ErrorState message="Çalışan bilgileri yüklenemedi." onRetry={() => window.location.reload()} />
  }

  if (!organizationUnitId) {
    return (
      <>
        <PageHeader title="Ekip Değerlendirmeleri" />
        <EmptyState message="Bir organizasyon birimine atanmadığınızdan ekibiniz belirlenemiyor." />
      </>
    )
  }

  if (isTeamPending || isFormPending) {
    return (
      <>
        <PageHeader title="Ekip Değerlendirmeleri" />
        <LoadingSkeleton rows={4} />
      </>
    )
  }

  if (isTeamError) {
    return <ErrorState message="Ekip bilgisi yüklenemedi." onRetry={() => refetchTeam()} />
  }

  if (teamMembers.length === 0) {
    return (
      <>
        <PageHeader title="Ekip Değerlendirmeleri" />
        <EmptyState message="Biriminizde başka bir çalışan yok." />
      </>
    )
  }

  if (formMissing) {
    return (
      <>
        <PageHeader title="Ekip Değerlendirmeleri" />
        <EmptyState message="Puanlama skalası henüz tanımlanmadığından değerlendirme formu kullanılamıyor." />
      </>
    )
  }

  if (isFormError || !form) {
    return <ErrorState message="Değerlendirme formu yüklenemedi." onRetry={() => window.location.reload()} />
  }

  async function onSubmit(values: ScoreFormValues) {
    if (!selectedEmployeeId) {
      setSubmitError('Çalışan seçilmelidir.')
      return
    }
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
    if (!values.period) {
      setSubmitError('Dönem boş olamaz.')
      return
    }
    if (scores.length === 0) {
      setSubmitError('En az bir puan girilmelidir.')
      return
    }
    try {
      await submitManagerAssessment.mutateAsync({
        employeeId: Number(selectedEmployeeId),
        period: values.period,
        scores,
        teamEmployeeIds,
      })
      showToast('Değerlendirme gönderildi')
      reset({ period: '' })
      navigate(`/performance/results/${selectedEmployeeId}`)
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.')
    }
  }

  return (
    <>
      <PageHeader title="Ekip Değerlendirmeleri" />
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={2.5}>
            {submitError && (
              <Grid size={12}>
                <Alert severity="error">{submitError}</Alert>
              </Grid>
            )}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Çalışan"
                fullWidth
                value={selectedEmployeeId}
                onChange={(event) => setSelectedEmployeeId(event.target.value)}
              >
                {teamMembers.map((member) => (
                  <MenuItem key={member.id} value={String(member.id)}>
                    {member.firstName} {member.lastName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField {...register('period')} label="Dönem" placeholder="2026-Q1" fullWidth />
            </Grid>
            <Grid size={12}>
              <Typography variant="body2" color="text.secondary">
                Puan aralığı: {form.scale.minValue}–{form.scale.maxValue}
              </Typography>
            </Grid>
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
