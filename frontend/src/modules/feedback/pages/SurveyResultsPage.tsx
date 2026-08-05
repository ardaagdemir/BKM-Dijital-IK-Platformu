import LinearProgress from '@mui/material/LinearProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useParams } from 'react-router-dom'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { useSurveyResults } from '../api/useSurveyResults'

// US-08E.1.3: Seçenek bazlı yüzdesel dağılım — "grafik/çubuk gösterim"
// kabul kriteri, yeni bir grafik kütüphanesi EKLENMEDEN (`package.json`'da
// hiçbiri yok) MUI `LinearProgress` çubuklarıyla karşılanıyor.
export function SurveyResultsPage() {
  const { id } = useParams<{ id: string }>()
  const surveyId = Number(id)
  const { data: results, isPending, isError, refetch } = useSurveyResults(surveyId)

  if (isPending) {
    return (
      <>
        <PageHeader title="Anket Sonuçları" />
        <LoadingSkeleton rows={4} />
      </>
    )
  }

  if (isError) {
    return <ErrorState message="Anket sonuçları yüklenemedi." onRetry={() => refetch()} />
  }

  if (!results) {
    return (
      <>
        <PageHeader title="Anket Sonuçları" />
        <EmptyState message="Anket bulunamadı." />
      </>
    )
  }

  return (
    <>
      <PageHeader title="Anket Sonuçları" />
      <Paper sx={{ p: { xs: 2, sm: 3 }, maxWidth: 640 }}>
        <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
          {results.question}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Toplam yanıt: {results.totalResponses}
        </Typography>

        {results.options.length === 0 && <EmptyState message="Bu ankete ait seçenek bulunamadı." />}

        <Stack spacing={2.5}>
          {results.options.map((option) => (
            <Stack key={option.optionId} spacing={0.5}>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2">{option.text}</Typography>
                <Typography variant="body2" color="text.secondary">
                  %{option.percentage} ({option.voteCount})
                </Typography>
              </Stack>
              <LinearProgress variant="determinate" value={option.percentage} sx={{ height: 8, borderRadius: 1 }} />
            </Stack>
          ))}
        </Stack>
      </Paper>
    </>
  )
}
