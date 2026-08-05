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
import { leaveTypeSchema, type LeaveTypeFormValues } from '../schema'

type LeaveTypeFormDialogProps = {
  open: boolean
  mode: 'create' | 'edit'
  initialValues?: LeaveTypeFormValues
  submitting: boolean
  errorMessage: string | null
  onSubmit: (values: LeaveTypeFormValues) => void
  onClose: () => void
}

// `organization.JobTitleFormDialog`'daki AYNI desen (bkz. o dosyadaki
// gerekçe) — burada tek fark iki alan (name+code) olması.
export function LeaveTypeFormDialog({
  open,
  mode,
  initialValues,
  submitting,
  errorMessage,
  onSubmit,
  onClose,
}: LeaveTypeFormDialogProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeaveTypeFormValues>({
    resolver: zodResolver(leaveTypeSchema),
    defaultValues: initialValues ?? { name: '', code: '' },
  })

  useEffect(() => {
    if (open) {
      reset(initialValues ?? { name: '', code: '' })
    }
  }, [open, initialValues, reset])

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="xs" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Yeni İzin Türü' : 'İzin Türünü Düzenle'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            <TextField
              {...register('name')}
              label="İzin Türü Adı"
              autoFocus
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              {...register('code')}
              label="Kod"
              fullWidth
              error={!!errors.code}
              helperText={errors.code?.message}
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
