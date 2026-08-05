import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { candidateNoteSchema, type CandidateNoteFormValues } from '../schema'

type CandidateNoteFormDialogProps = {
  open: boolean
  submitting: boolean
  errorMessage: string | null
  onSubmit: (values: CandidateNoteFormValues) => void
  onClose: () => void
}

// `organization.AssetFormDialog`'daki AYNI iskelet (bkz. o dosyadaki
// gerekçe) — tek fark tek bir çok satırlı metin alanı.
export function CandidateNoteFormDialog({ open, submitting, errorMessage, onSubmit, onClose }: CandidateNoteFormDialogProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CandidateNoteFormValues>({
    resolver: zodResolver(candidateNoteSchema),
    defaultValues: { noteText: '' },
  })

  useEffect(() => {
    if (open) {
      reset({ noteText: '' })
    }
  }, [open, reset])

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="xs" fullWidth>
      <DialogTitle>Yeni Not</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            <TextField
              {...register('noteText')}
              label="Not"
              autoFocus
              multiline
              rows={3}
              fullWidth
              error={!!errors.noteText}
              helperText={errors.noteText?.message}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            Vazgeç
          </Button>
          <Button type="submit" variant="contained" loading={submitting}>
            Ekle
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
