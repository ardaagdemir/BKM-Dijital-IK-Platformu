import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { DetailField } from '../../../shared/components/DetailField'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../../shared/components/ResponsiveTable'
import { useFinalScore } from '../api/useFinalScore'
import { useManagerAssessments } from '../api/useManagerAssessments'
import type { ManagerAssessmentSummary } from '../types'

function formatScore(score: number | null): string {
  return score === null ? '—' : score.toFixed(1)
}

// US-06.3.1: "Dönem bazlı liste görüntülenir." — çalışan KENDİ sonuçlarını
// (nav'dan `/employees/me` ile çözülen id'ye yönlendirilerek) görür,
// YONETICI ekip üyelerinin sonuçlarına `TeamAssessmentsPage`'in gönderim
// sonrası yönlendirmesiyle ulaşır (bkz. o sayfadaki not). Rol kısıtı YOK —
// backend'in KENDİSİ bu uçlarda kısıt uygulamıyor (bkz. ManagerAssessmentController
// javadoc'u), frontend rota seviyesinde de GÖRSEL bir kısıt EKLEMEZ (herkes
// erişebilir; hangi employeeId'ye gidileceği menüden/akıştan gelir).
export function PerformanceResultsPage() {
  const { employeeId } = useParams<{ employeeId: string }>()
  const id = Number(employeeId)
  const { data: assessments, isPending, isError, refetch } = useManagerAssessments(id)
  const [detailTarget, setDetailTarget] = useState<ManagerAssessmentSummary | null>(null)

  const columns: ResponsiveTableColumn<ManagerAssessmentSummary>[] = [
    { key: 'period', header: 'Dönem', primary: true, render: (row) => row.period },
    { key: 'finalScore', header: 'Nihai Not', render: (row) => formatScore(row.finalScore) },
  ]

  return (
    <>
      <PageHeader title="Performans Sonuçları" />

      {isPending && <LoadingSkeleton rows={4} />}
      {isError && <ErrorState message="Sonuçlar yüklenemedi." onRetry={() => refetch()} />}
      {!isPending && !isError && assessments?.length === 0 && (
        <EmptyState message="Henüz bir değerlendirme sonucu yok." />
      )}
      {!isPending && !isError && !!assessments?.length && (
        <ResponsiveTable
          columns={columns}
          rows={assessments}
          getRowKey={(row) => row.id}
          actions={(row) =>
            row.finalScore !== null ? (
              <Button size="small" onClick={() => setDetailTarget(row)}>
                Detay
              </Button>
            ) : null
          }
        />
      )}

      <FinalScoreDialog target={detailTarget} onClose={() => setDetailTarget(null)} />
    </>
  )
}

function FinalScoreDialog({ target, onClose }: { target: ManagerAssessmentSummary | null; onClose: () => void }) {
  const { data: finalScore, isPending } = useFinalScore(target?.id)

  return (
    <Dialog open={!!target} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{target?.period} Dönemi Nihai Not Ayrıntısı</DialogTitle>
      <DialogContent>
        {isPending && <LoadingSkeleton rows={3} />}
        {finalScore && (
          <Stack spacing={2} sx={{ pb: 1 }}>
            <DetailField
              label={`Hedef Puanı (ağırlık %${finalScore.goalWeight})`}
              value={formatScore(finalScore.goalScore)}
            />
            <DetailField
              label={`Yetkinlik Puanı (ağırlık %${finalScore.competencyWeight})`}
              value={formatScore(finalScore.competencyScore)}
            />
            <DetailField label="Nihai Not" value={formatScore(finalScore.finalScore)} />
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  )
}
