import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ApiError } from '../../../shared/api/ApiError'
import { AccordionList, type AccordionListColumn } from '../../../shared/components/AccordionList'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { useToast } from '../../../shared/components/ToastProvider'
import { useCreateJobDescription } from '../api/useCreateJobDescription'
import { useJobDescriptions } from '../api/useJobDescriptions'
import { useJobTitles } from '../api/useJobTitles'
import { jobDescriptionSchema, type JobDescriptionFormValues } from '../schema'
import type { JobDescription } from '../types'

// US-08I.1.2: Unvan bazlı görev tanımı yazma/listeleme — `discipline.WarningsPage`'deki
// AYNI "ÖNCE bağlam seç (burada unvan, orada çalışan), sonra kayıt
// yönet" deseni. `JobDescriptionController` GÜNCELLEME/SİLME ucu
// SUNMADIĞINDAN bu bir "ekle-devam-et" günlüğü (warnings/awards'daki
// AYNI append-only model).
export function JobDescriptionsPage() {
  const { showToast } = useToast()
  const { data: jobTitles } = useJobTitles()
  const [jobTitleId, setJobTitleId] = useState<number | ''>('')

  const {
    data: descriptions,
    isPending,
    isError,
    refetch,
  } = useJobDescriptions(jobTitleId === '' ? 0 : jobTitleId)
  const createDescription = useCreateJobDescription()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<JobDescriptionFormValues>({
    resolver: zodResolver(jobDescriptionSchema),
    defaultValues: { jobTitleId: '', content: '' },
  })

  async function onSubmit(values: JobDescriptionFormValues) {
    setFormError(null)
    try {
      await createDescription.mutateAsync({ jobTitleId: Number(values.jobTitleId), content: values.content })
      showToast('Görev tanımı kaydedildi')
      setDialogOpen(false)
      reset({ jobTitleId: '', content: '' })
    } catch (error) {
      setFormError(error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.')
    }
  }

  function openDialog() {
    if (jobTitleId === '') {
      return
    }
    setFormError(null)
    reset({ jobTitleId: String(jobTitleId), content: '' })
    setDialogOpen(true)
  }

  const columns: AccordionListColumn<JobDescription>[] = [
    { key: 'content', header: 'Görev Tanımı', render: (row) => row.content },
  ]

  return (
    <>
      <PageHeader
        title="Görev Tanımları"
        action={jobTitleId !== '' ? { label: 'Yeni Görev Tanımı', onClick: openDialog } : undefined}
      />

      <Grid container sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            label="Unvan"
            fullWidth
            value={jobTitleId}
            onChange={(event) => setJobTitleId(event.target.value === '' ? '' : Number(event.target.value))}
          >
            {(jobTitles ?? []).map((jobTitle) => (
              <MenuItem key={jobTitle.id} value={jobTitle.id}>
                {jobTitle.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {jobTitleId === '' && <EmptyState message="Görev tanımlarını görüntülemek için bir unvan seçin." />}
      {jobTitleId !== '' && isPending && <LoadingSkeleton rows={3} />}
      {jobTitleId !== '' && isError && <ErrorState message="Görev tanımları yüklenemedi." onRetry={() => refetch()} />}
      {jobTitleId !== '' && !isPending && !isError && descriptions?.length === 0 && (
        <EmptyState message="Bu unvan için henüz bir görev tanımı yazılmadı." />
      )}
      {jobTitleId !== '' && !isPending && !isError && !!descriptions?.length && (
        <AccordionList
          columns={columns}
          rows={descriptions}
          getRowKey={(row) => row.id}
          renderSummary={(row) => row.content.slice(0, 60) + (row.content.length > 60 ? '…' : '')}
          renderDetail={(row) => <Stack spacing={1}>{row.content}</Stack>}
        />
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni Görev Tanımı</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <input type="hidden" {...register('jobTitleId')} />
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 0.5 }}>
              {formError && <Alert severity="error">{formError}</Alert>}
              <TextField
                {...register('content')}
                label="Görev Tanımı"
                autoFocus
                fullWidth
                multiline
                rows={6}
                error={!!errors.content}
                helperText={errors.content?.message}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
              Vazgeç
            </Button>
            <Button type="submit" variant="contained" loading={isSubmitting}>
              Kaydet
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}
