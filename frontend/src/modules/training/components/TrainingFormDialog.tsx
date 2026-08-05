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
import { trainingSchema, type TrainingFormValues } from '../schema'

type TrainingFormDialogProps = {
  open: boolean
  mode: 'create' | 'edit'
  initialValues?: TrainingFormValues
  submitting: boolean
  errorMessage: string | null
  onSubmit: (values: TrainingFormValues) => void
  onClose: () => void
}

// `attendance.WorkModelFormDialog`'daki AYNI iskelet.
export function TrainingFormDialog({
  open,
  mode,
  initialValues,
  submitting,
  errorMessage,
  onSubmit,
  onClose,
}: TrainingFormDialogProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TrainingFormValues>({
    resolver: zodResolver(trainingSchema),
    defaultValues: initialValues ?? { name: '', type: '', durationHours: '', provider: '' },
  })

  useEffect(() => {
    if (open) {
      reset(initialValues ?? { name: '', type: '', durationHours: '', provider: '' })
    }
  }, [open, initialValues, reset])

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="xs" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Yeni Eğitim' : 'Eğitimi Düzenle'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            <TextField
              {...register('name')}
              label="Eğitim Adı"
              autoFocus
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              {...register('type')}
              label="Tür"
              fullWidth
              error={!!errors.type}
              helperText={errors.type?.message}
            />
            <TextField
              {...register('durationHours')}
              type="number"
              label="Süre (Saat)"
              fullWidth
              error={!!errors.durationHours}
              helperText={errors.durationHours?.message}
            />
            <TextField
              {...register('provider')}
              label="Sağlayıcı"
              fullWidth
              error={!!errors.provider}
              helperText={errors.provider?.message}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            Vazgeç
          </Button>
          <Button type="submit" variant="contained" loading={submitting}>
            {mode === 'create' ? 'Oluştur' : 'Kaydet'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
