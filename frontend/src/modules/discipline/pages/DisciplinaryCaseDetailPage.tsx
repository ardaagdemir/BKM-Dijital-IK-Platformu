import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { ApiError } from '../../../shared/api/ApiError'
import { AccordionList, type AccordionListColumn } from '../../../shared/components/AccordionList'
import { DetailField } from '../../../shared/components/DetailField'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { StatusChip } from '../../../shared/components/StatusChip'
import { useToast } from '../../../shared/components/ToastProvider'
import { useCloseDisciplinaryCase } from '../api/useCloseDisciplinaryCase'
import { useDisciplinaryCaseRevisions } from '../api/useDisciplinaryCaseRevisions'
import { useRecordDefense } from '../api/useRecordDefense'
import { defenseSchema, type DefenseFormValues } from '../schema'
import { DISCIPLINARY_CASE_STATUS_LABELS } from '../statusLabels'
import type { DisciplinaryCaseRevision } from '../types'

function formatDateTime(iso: string): string {
  return dayjs(iso).format('DD.MM.YYYY HH:mm')
}

// US-08C.1.2/US-08C.1.3: Savunma kaydı + kapatma (savunma boşken "Kapat"
// DISABLED — kabul kriteri) + revizyon geçmişi (`AccordionList`, roadmap'in
// kendi notu). Güncel durum, revizyon listesinin İLK elemanı (backend/servis
// EN YENİYİ İLK sırada döner) — ayrı bir "tekil kayıt" ucu YOK (bkz.
// `DisciplinaryCaseController`'daki 14.7/8C notu).
export function DisciplinaryCaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const caseId = Number(id)
  const { showToast } = useToast()

  const { data: revisions, isPending, isError, refetch } = useDisciplinaryCaseRevisions(caseId)
  const current = revisions?.[0]

  const recordDefense = useRecordDefense()
  const closeCase = useCloseDisciplinaryCase()
  const [defenseError, setDefenseError] = useState<string | null>(null)
  const [closeError, setCloseError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DefenseFormValues>({ resolver: zodResolver(defenseSchema), defaultValues: { defense: '' } })

  useEffect(() => {
    if (current) {
      reset({ defense: current.defense ?? '' })
    }
  }, [current, reset])

  async function onSubmit(values: DefenseFormValues) {
    setDefenseError(null)
    try {
      await recordDefense.mutateAsync({ id: caseId, defense: values.defense })
      showToast('Savunma kaydedildi')
    } catch (error) {
      setDefenseError(error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.')
    }
  }

  async function handleClose() {
    setCloseError(null)
    try {
      await closeCase.mutateAsync(caseId)
      showToast('Ceza süreci kapatıldı')
    } catch (error) {
      setCloseError(error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.')
    }
  }

  if (isPending) {
    return (
      <>
        <PageHeader title="Ceza Süreci" />
        <LoadingSkeleton rows={4} />
      </>
    )
  }

  if (isError || !current) {
    return <ErrorState message="Ceza süreci yüklenemedi." onRetry={() => refetch()} />
  }

  const canRecordDefense = current.status === 'OPEN'
  const canClose = current.status === 'OPEN' && !!current.defense?.trim()

  const revisionColumns: AccordionListColumn<DisciplinaryCaseRevision>[] = [
    { key: 'createdAt', header: 'Tarih', render: (row) => formatDateTime(row.createdAt) },
    { key: 'status', header: 'Durum', render: (row) => <StatusChip {...DISCIPLINARY_CASE_STATUS_LABELS[row.status]} /> },
    { key: 'defense', header: 'Savunma', render: (row) => row.defense ?? '—' },
  ]

  return (
    <>
      <PageHeader title="Ceza Süreci" />
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DetailField label="Gerekçe" value={current.reason} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack spacing={0.25}>
              <Typography variant="caption" color="text.secondary">
                Durum
              </Typography>
              <StatusChip {...DISCIPLINARY_CASE_STATUS_LABELS[current.status]} />
            </Stack>
          </Grid>
        </Grid>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
            {defenseError && (
              <Grid size={12}>
                <Alert severity="error">{defenseError}</Alert>
              </Grid>
            )}
            <Grid size={12}>
              <TextField
                {...register('defense')}
                label="Savunma"
                fullWidth
                multiline
                rows={3}
                disabled={!canRecordDefense}
                error={!!errors.defense}
                helperText={errors.defense?.message}
              />
            </Grid>
            <Grid size={12}>
              <Stack direction="row" spacing={1.5}>
                <Button type="submit" variant="outlined" loading={isSubmitting} disabled={!canRecordDefense}>
                  Savunmayı Kaydet
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  loading={closeCase.isPending}
                  disabled={!canClose}
                  onClick={handleClose}
                >
                  Kapat
                </Button>
              </Stack>
              {closeError && (
                <Alert severity="error" sx={{ mt: 1.5 }}>
                  {closeError}
                </Alert>
              )}
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
        Revizyon Geçmişi
      </Typography>
      <AccordionList
        columns={revisionColumns}
        rows={revisions ?? []}
        getRowKey={(row) => row.id}
        renderSummary={(row) => `${formatDateTime(row.createdAt)} · ${DISCIPLINARY_CASE_STATUS_LABELS[row.status].label}`}
        renderDetail={(row) => (
          <Stack spacing={1}>
            <DetailField label="Savunma" value={row.defense ?? '—'} />
          </Stack>
        )}
      />
    </>
  )
}
