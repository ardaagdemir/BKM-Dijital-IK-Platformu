import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FileUploadZone } from '../../../shared/components/FileUploadZone'
import { policyDocumentSchema, type PolicyDocumentFormValues } from '../schema'

type PolicyDocumentFormDialogProps = {
  open: boolean
  mode: 'create' | 'new-version'
  submitting: boolean
  errorMessage: string | null
  onSubmit: (values: { title?: string; file: File }) => void
  onClose: () => void
}

// US-08I.1.1: `recruitment.CareersApplyPage`'deki AYNI `FileUploadZone` +
// multipart deseni. `mode==='new-version'` iken `title` alanı HİÇ
// GÖSTERİLMEZ — backend önceki versiyondan miras alır (bkz.
// PolicyDocumentService.upload'daki not), istemci göndermez.
export function PolicyDocumentFormDialog({
  open,
  mode,
  submitting,
  errorMessage,
  onSubmit,
  onClose,
}: PolicyDocumentFormDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [titleError, setTitleError] = useState<string | null>(null)

  const { register, handleSubmit, reset } = useForm<PolicyDocumentFormValues>({
    resolver: zodResolver(policyDocumentSchema),
    defaultValues: { title: '' },
  })

  useEffect(() => {
    if (open) {
      reset({ title: '' })
      setFile(null)
      setFileError(null)
      setTitleError(null)
    }
  }, [open, reset])

  function handleFormSubmit(values: PolicyDocumentFormValues) {
    let valid = true
    if (mode === 'create' && !values.title.trim()) {
      setTitleError('Başlık boş olamaz.')
      valid = false
    } else {
      setTitleError(null)
    }
    if (!file) {
      setFileError('Doküman dosyası boş olamaz.')
      valid = false
    } else {
      setFileError(null)
    }
    if (!valid) {
      return
    }
    onSubmit(mode === 'create' ? { title: values.title, file: file! } : { file: file! })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Yeni Doküman' : 'Yeni Versiyon Yükle'}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            {mode === 'create' && (
              <TextField
                {...register('title')}
                label="Başlık"
                autoFocus
                fullWidth
                error={!!titleError}
                helperText={titleError ?? undefined}
              />
            )}
            <FileUploadZone label="Doküman" value={file} onChange={setFile} error={fileError ?? undefined} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            Vazgeç
          </Button>
          <Button type="submit" variant="contained" loading={submitting}>
            Yükle
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
