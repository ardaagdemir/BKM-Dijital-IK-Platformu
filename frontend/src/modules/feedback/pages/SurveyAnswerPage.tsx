import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import Paper from '@mui/material/Paper'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Stack from '@mui/material/Stack'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../../../shared/api/ApiError'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { useToast } from '../../../shared/components/ToastProvider'
import { useMyEmployee } from '../../organization/api/useMyEmployee'
import { useSubmitSurveyAnswer } from '../api/useSubmitSurveyAnswer'
import { useSurveys } from '../api/useSurveys'
import { surveyAnswerSchema, type SurveyAnswerFormValues } from '../schema'

// US-08E.1.2: Ankete yanıt verme. `GET /api/surveys/{id}` ucu YOK (yalnızca
// liste + sonuç uçları var) — DisciplinaryCaseDetailPage'in `revisions[0]`'dan
// güncel durumu türetmesindeki AYNI karar: tek anket, listeden `find` ile
// türetilir, gereksiz bir "tekil anket getir" ucu İCAT EDİLMEDİ.
export function SurveyAnswerPage() {
  const { id } = useParams<{ id: string }>()
  const surveyId = Number(id)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const { data: surveys, isPending: isSurveysPending, isError: isSurveysError, refetch } = useSurveys()
  const survey = surveys?.find((item) => item.id === surveyId)

  const {
    data: employee,
    isPending: isEmployeePending,
    isError: isEmployeeError,
    error: employeeError,
  } = useMyEmployee()
  const employeeMissing = isEmployeeError && employeeError instanceof ApiError && employeeError.status === 404

  const submitAnswer = useSubmitSurveyAnswer(surveyId)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SurveyAnswerFormValues>({
    resolver: zodResolver(surveyAnswerSchema),
    defaultValues: { surveyOptionId: '' },
  })

  if (isSurveysPending || (survey && !survey.anonymous && isEmployeePending)) {
    return (
      <>
        <PageHeader title="Anketi Yanıtla" />
        <LoadingSkeleton rows={4} />
      </>
    )
  }

  if (isSurveysError) {
    return <ErrorState message="Anket yüklenemedi." onRetry={() => refetch()} />
  }

  if (!survey) {
    return (
      <>
        <PageHeader title="Anketi Yanıtla" />
        <EmptyState message="Anket bulunamadı." />
      </>
    )
  }

  if (!survey.anonymous && employeeMissing) {
    return (
      <>
        <PageHeader title="Anketi Yanıtla" />
        <EmptyState message="Sisteme bağlı bir çalışan kaydınız bulunamadığından anonim OLMAYAN bu anketi yanıtlayamazsınız." />
      </>
    )
  }

  async function onSubmit(values: SurveyAnswerFormValues) {
    try {
      await submitAnswer.mutateAsync({
        surveyOptionId: Number(values.surveyOptionId),
        employeeId: survey!.anonymous ? null : (employee?.id ?? null),
      })
      showToast('Yanıtınız kaydedildi')
      navigate('/surveys')
    } catch {
      // Hata `submitAnswer.error` üzerinden aşağıda gösterilir.
    }
  }

  return (
    <>
      <PageHeader title="Anketi Yanıtla" />
      <Paper sx={{ p: { xs: 2, sm: 3 }, maxWidth: 560 }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={2.5}>
            {submitAnswer.isError && (
              <Alert severity="error">
                {submitAnswer.error instanceof ApiError
                  ? submitAnswer.error.detail
                  : 'Beklenmeyen bir hata oluştu, tekrar deneyin.'}
              </Alert>
            )}
            <Controller
              control={control}
              name="surveyOptionId"
              render={({ field }) => (
                <FormControl error={!!errors.surveyOptionId}>
                  <FormLabel>{survey.question}</FormLabel>
                  <RadioGroup {...field}>
                    {survey.options.map((option) => (
                      <FormControlLabel
                        key={option.id}
                        value={String(option.id)}
                        control={<Radio />}
                        label={option.text}
                      />
                    ))}
                  </RadioGroup>
                  {errors.surveyOptionId && <Alert severity="error">{errors.surveyOptionId.message}</Alert>}
                </FormControl>
              )}
            />
            <Button type="submit" variant="contained" loading={isSubmitting} sx={{ alignSelf: 'flex-start' }}>
              Yanıtı Gönder
            </Button>
          </Stack>
        </form>
      </Paper>
    </>
  )
}
