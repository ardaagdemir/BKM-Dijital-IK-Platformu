import AddIcon from '@mui/icons-material/Add'
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'
import HowToVoteOutlinedIcon from '@mui/icons-material/HowToVoteOutlined'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../../shared/api/ApiError'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../../shared/components/ResponsiveTable'
import { useToast } from '../../../shared/components/ToastProvider'
import { useAuth } from '../../auth/AuthProvider'
import { useCreateSurvey } from '../api/useCreateSurvey'
import { useSurveys } from '../api/useSurveys'
import { SurveyFormDialog } from '../components/SurveyFormDialog'
import type { SurveyFormValues } from '../schema'
import type { Survey } from '../types'

// US-08E.1.1: Anket oluşturma/listeleme — GET /api/surveys backend'de rol
// kısıtlı DEĞİL (bkz. SurveyController javadoc'u), bu yüzden liste HERKESE
// (oturumlu) görünür; yalnızca "Yeni Anket" oluşturma aksiyonu ADMIN/IK'ya
// GÖRSEL olarak kısıtlanır ("Yanıtla" aksiyonu ise HERKES için — anket
// yönetimiyle yanıtlama TEK sayfada birleşti, roadmap'in ayrı `/surveys/new`
// route'u İCAT EDİLMEDİ, `travel.TravelRequestsPage`'deki AYNI birleştirme).
export function SurveysPage() {
  const { user } = useAuth()
  const isAdmin = !!user?.roles.some((role) => role === 'ADMIN' || role === 'IK')
  const navigate = useNavigate()
  const { showToast } = useToast()

  const { data: surveys, isPending, isError, refetch } = useSurveys()
  const createSurvey = useCreateSurvey()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function handleSubmit(values: SurveyFormValues) {
    setFormError(null)
    try {
      await createSurvey.mutateAsync({
        question: values.question,
        options: values.options.map((option) => option.text),
        anonymous: values.anonymous,
      })
      showToast('Anket oluşturuldu')
      setDialogOpen(false)
    } catch (error) {
      setFormError(error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.')
    }
  }

  const columns: ResponsiveTableColumn<Survey>[] = [
    { key: 'question', header: 'Soru', primary: true, render: (row) => row.question },
    { key: 'options', header: 'Seçenek Sayısı', render: (row) => String(row.options.length) },
    { key: 'anonymous', header: 'Anonim', render: (row) => (row.anonymous ? 'Evet' : 'Hayır') },
  ]

  return (
    <>
      <PageHeader
        title="Anketler"
        action={isAdmin ? { label: 'Yeni Anket', icon: <AddIcon />, onClick: () => setDialogOpen(true) } : undefined}
      />

      {isPending && <LoadingSkeleton rows={4} />}
      {isError && <ErrorState message="Anketler yüklenemedi." onRetry={() => refetch()} />}
      {!isPending && !isError && surveys?.length === 0 && <EmptyState message="Henüz bir anket oluşturulmadı." />}
      {!isPending && !isError && !!surveys?.length && (
        <ResponsiveTable
          columns={columns}
          rows={surveys}
          getRowKey={(row) => row.id}
          actions={(row) => (
            <>
              <Tooltip title="Yanıtla">
                <IconButton
                  size="small"
                  aria-label={`${row.question} anketini yanıtla`}
                  onClick={() => navigate(`/surveys/${row.id}/answer`)}
                >
                  <HowToVoteOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {isAdmin && (
                <Tooltip title="Sonuçlar">
                  <IconButton
                    size="small"
                    aria-label={`${row.question} anketinin sonuçlarını gör`}
                    onClick={() => navigate(`/surveys/${row.id}/results`)}
                  >
                    <BarChartOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}
        />
      )}

      <SurveyFormDialog
        open={dialogOpen}
        submitting={createSurvey.isPending}
        errorMessage={formError}
        onSubmit={handleSubmit}
        onClose={() => setDialogOpen(false)}
      />
    </>
  )
}
