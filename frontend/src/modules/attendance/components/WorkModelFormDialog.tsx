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
import { workModelSchema, type WorkModelFormValues } from '../schema'

type WorkModelFormDialogProps = {
  open: boolean
  mode: 'create' | 'edit'
  initialValues?: WorkModelFormValues
  submitting: boolean
  errorMessage: string | null
  onSubmit: (values: WorkModelFormValues) => void
  onClose: () => void
}

// `leave.LeaveTypeFormDialog`'daki AYNI iskelet — saat alanları HTML
// `type="time"` input'u (tarayıcının kendi saat seçicisi, ayrı bir
// zaman-seçici bileşen İCAT EDİLMEDİ).
export function WorkModelFormDialog({
  open,
  mode,
  initialValues,
  submitting,
  errorMessage,
  onSubmit,
  onClose,
}: WorkModelFormDialogProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WorkModelFormValues>({
    resolver: zodResolver(workModelSchema),
    defaultValues: initialValues ?? { name: '', plannedStartTime: '', plannedEndTime: '' },
  })

  useEffect(() => {
    if (open) {
      reset(initialValues ?? { name: '', plannedStartTime: '', plannedEndTime: '' })
    }
  }, [open, initialValues, reset])

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="xs" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Yeni Çalışma Modeli' : 'Çalışma Modelini Düzenle'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            <TextField
              {...register('name')}
              label="Çalışma Modeli Adı"
              autoFocus
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              {...register('plannedStartTime')}
              type="time"
              label="Planlanan Başlangıç Saati"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              error={!!errors.plannedStartTime}
              helperText={errors.plannedStartTime?.message}
            />
            <TextField
              {...register('plannedEndTime')}
              type="time"
              label="Planlanan Bitiş Saati"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              error={!!errors.plannedEndTime}
              helperText={errors.plannedEndTime?.message}
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
