import AddIcon from '@mui/icons-material/Add'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../../../shared/api/ApiError'
import { DetailField } from '../../../shared/components/DetailField'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../../shared/components/ResponsiveTable'
import { StatusChip } from '../../../shared/components/StatusChip'
import { useToast } from '../../../shared/components/ToastProvider'
import { downloadBlob } from '../../../shared/utils/downloadBlob'
import * as recruitmentApi from '../api/recruitmentApi'
import { useAddCandidateNote } from '../api/useAddCandidateNote'
import { useCandidate } from '../api/useCandidate'
import { useCandidateNotes } from '../api/useCandidateNotes'
import { useChangeCandidateStage } from '../api/useChangeCandidateStage'
import { useConvertCandidateToEmployee } from '../api/useConvertCandidateToEmployee'
import { useCreateInterview } from '../api/useCreateInterview'
import { useInterviews } from '../api/useInterviews'
import { CandidateNoteFormDialog } from '../components/CandidateNoteFormDialog'
import { InterviewFormDialog } from '../components/InterviewFormDialog'
import { CANDIDATE_STAGE_LABELS } from '../statusLabels'
import type { CandidateNote, CandidateStage, Interview } from '../types'

const STAGE_OPTIONS: CandidateStage[] = ['APPLICATION', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED']

// US-05.2.1/US-05.2.2/US-05.4.1/US-05.4.2: aday detayı — temel bilgiler +
// aşama değiştirme + not ekleme/listeleme + mülakat kaydı ekleme/listeleme +
// çalışana dönüştürme. `organization.EmployeeDetailPage`'deki (14.2)
// Paper-başına-bölüm deseni izlenir; sekmeye GEREK YOK (daha az bölüm var).
export function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const candidateId = Number(id)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const { data: candidate, isPending, isError, refetch } = useCandidate(candidateId)
  const changeStage = useChangeCandidateStage()
  const convertToEmployee = useConvertCandidateToEmployee()

  const [stageDraft, setStageDraft] = useState<CandidateStage | ''>('')
  const [stageError, setStageError] = useState<string | null>(null)
  const [convertError, setConvertError] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  if (isPending) {
    return (
      <>
        <PageHeader title="Aday" />
        <LoadingSkeleton rows={6} />
      </>
    )
  }

  if (isError || !candidate) {
    return <ErrorState message="Aday yüklenemedi." onRetry={() => refetch()} />
  }

  const currentStage = stageDraft || candidate.stage

  async function handleStageSave() {
    if (!candidate || !stageDraft || stageDraft === candidate.stage) {
      return
    }
    setStageError(null)
    try {
      await changeStage.mutateAsync({ id: candidate.id, stage: stageDraft })
      showToast('Aşama güncellendi')
      setStageDraft('')
    } catch (error) {
      setStageError(error instanceof ApiError ? error.detail : 'Aşama güncellenemedi, tekrar deneyin.')
    }
  }

  async function handleConvert() {
    if (!candidate) {
      return
    }
    setConvertError(null)
    try {
      const draft = await convertToEmployee.mutateAsync(candidate.id)
      showToast('Aday çalışan taslağına dönüştürüldü')
      navigate('/organization/employees/new', { state: draft })
    } catch (error) {
      setConvertError(error instanceof ApiError ? error.detail : 'Dönüştürme başarısız, tekrar deneyin.')
    }
  }

  async function handleDownloadCv() {
    if (!candidate) {
      return
    }
    setDownloadError(null)
    try {
      const blob = await recruitmentApi.downloadCandidateCv(candidate.id)
      downloadBlob(blob, candidate.cvFileName)
    } catch (error) {
      setDownloadError(error instanceof ApiError ? error.detail : 'CV indirilemedi, tekrar deneyin.')
    }
  }

  return (
    <>
      <PageHeader title={`${candidate.firstName} ${candidate.lastName}`} />

      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        {stageError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {stageError}
          </Alert>
        )}
        {convertError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {convertError}
          </Alert>
        )}
        {downloadError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {downloadError}
          </Alert>
        )}
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DetailField label="E-posta" value={candidate.email} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DetailField label="Başvurulan Pozisyon" value={candidate.appliedPosition} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack spacing={0.25}>
              <Typography variant="caption" color="text.secondary">
                CV
              </Typography>
              <Button
                size="small"
                startIcon={<DownloadOutlinedIcon />}
                onClick={handleDownloadCv}
                sx={{ alignSelf: 'flex-start' }}
              >
                {candidate.cvFileName}
              </Button>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack spacing={0.25}>
              <Typography variant="caption" color="text.secondary">
                Aşama
              </Typography>
              <StatusChip {...CANDIDATE_STAGE_LABELS[candidate.stage]} />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Aşamayı Değiştir"
              value={currentStage}
              onChange={(event) => setStageDraft(event.target.value as CandidateStage)}
              fullWidth
            >
              {STAGE_OPTIONS.map((stage) => (
                <MenuItem key={stage} value={stage}>
                  {CANDIDATE_STAGE_LABELS[stage].label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button
              variant="outlined"
              loading={changeStage.isPending}
              disabled={!stageDraft || stageDraft === candidate.stage}
              onClick={handleStageSave}
            >
              Aşamayı Kaydet
            </Button>
          </Grid>
          <Grid size={12}>
            <Button
              variant="contained"
              loading={convertToEmployee.isPending}
              disabled={candidate.converted}
              onClick={handleConvert}
            >
              {candidate.converted ? 'Çalışana Dönüştürüldü' : 'Çalışana Dönüştür'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <NotesSection candidateId={candidate.id} />
      <InterviewsSection candidateId={candidate.id} />
    </>
  )
}

function NotesSection({ candidateId }: { candidateId: number }) {
  const { showToast } = useToast()
  const { data: notes, isPending, isError, refetch } = useCandidateNotes(candidateId)
  const addNote = useAddCandidateNote(candidateId)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  async function handleSubmit(values: { noteText: string }) {
    setCreateError(null)
    try {
      await addNote.mutateAsync(values.noteText)
      showToast('Not eklendi')
      setDialogOpen(false)
    } catch (error) {
      setCreateError(error instanceof ApiError ? error.detail : 'Not eklenemedi, tekrar deneyin.')
    }
  }

  const columns: ResponsiveTableColumn<CandidateNote>[] = [
    { key: 'noteText', header: 'Not', primary: true, render: (row) => row.noteText },
  ]

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Notlar
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => {
            setCreateError(null)
            setDialogOpen(true)
          }}
        >
          Yeni Not
        </Button>
      </Stack>

      {isPending && <LoadingSkeleton rows={2} />}
      {isError && <ErrorState message="Notlar yüklenemedi." onRetry={() => refetch()} />}
      {!isPending && !isError && notes?.length === 0 && <EmptyState message="Henüz not eklenmedi." />}
      {!isPending && !isError && !!notes?.length && (
        <ResponsiveTable columns={columns} rows={notes} getRowKey={(row) => row.id} />
      )}

      <CandidateNoteFormDialog
        open={dialogOpen}
        submitting={addNote.isPending}
        errorMessage={createError}
        onSubmit={handleSubmit}
        onClose={() => setDialogOpen(false)}
      />
    </Paper>
  )
}

function InterviewsSection({ candidateId }: { candidateId: number }) {
  const { showToast } = useToast()
  const { data: interviews, isPending, isError, refetch } = useInterviews(candidateId)
  const createInterview = useCreateInterview(candidateId)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  async function handleSubmit(values: { interviewDate: string; participants: string; result: string }) {
    setCreateError(null)
    try {
      await createInterview.mutateAsync(values)
      showToast('Mülakat kaydı eklendi')
      setDialogOpen(false)
    } catch (error) {
      setCreateError(error instanceof ApiError ? error.detail : 'Mülakat kaydı eklenemedi, tekrar deneyin.')
    }
  }

  const columns: ResponsiveTableColumn<Interview>[] = [
    { key: 'interviewDate', header: 'Tarih', primary: true, render: (row) => row.interviewDate },
    { key: 'participants', header: 'Katılımcılar', render: (row) => row.participants },
    { key: 'result', header: 'Sonuç', render: (row) => row.result },
  ]

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Mülakatlar
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => {
            setCreateError(null)
            setDialogOpen(true)
          }}
        >
          Yeni Mülakat
        </Button>
      </Stack>

      {isPending && <LoadingSkeleton rows={2} />}
      {isError && <ErrorState message="Mülakatlar yüklenemedi." onRetry={() => refetch()} />}
      {!isPending && !isError && interviews?.length === 0 && <EmptyState message="Henüz mülakat kaydı yok." />}
      {!isPending && !isError && !!interviews?.length && (
        <ResponsiveTable columns={columns} rows={interviews} getRowKey={(row) => row.id} />
      )}

      <InterviewFormDialog
        open={dialogOpen}
        submitting={createInterview.isPending}
        errorMessage={createError}
        onSubmit={handleSubmit}
        onClose={() => setDialogOpen(false)}
      />
    </Paper>
  )
}
