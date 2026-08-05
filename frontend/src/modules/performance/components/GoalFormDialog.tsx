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
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { goalSchema, type GoalFormValues } from '../schema'

type GoalFormDialogProps = {
  open: boolean
  mode: 'create' | 'edit'
  initialValues?: GoalFormValues
  // Bu kalem HARİÇ diğer TÜM hedeflerin ağırlık toplamı — roadmap'in
  // "form içi canlı toplam göstergesi" kabul kriteri: kullanıcı ağırlığı
  // yazarken "yeni toplam"ı ANINDA görür (backend'in KENDİ 100 sınırı
  // kontrolünü TEKRARLAMAZ, yalnızca ÖNİZLEME — gerçek doğrulama submit'te
  // backend'den gelir).
  otherGoalsWeightTotal: number
  submitting: boolean
  errorMessage: string | null
  onSubmit: (values: GoalFormValues) => void
  onClose: () => void
}

export function GoalFormDialog({
  open,
  mode,
  initialValues,
  otherGoalsWeightTotal,
  submitting,
  errorMessage,
  onSubmit,
  onClose,
}: GoalFormDialogProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: initialValues ?? { name: '', weight: '' },
  })

  useEffect(() => {
    if (open) {
      reset(initialValues ?? { name: '', weight: '' })
    }
  }, [open, initialValues, reset])

  const currentWeight = Number(watch('weight')) || 0
  const projectedTotal = otherGoalsWeightTotal + currentWeight

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="xs" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Yeni Hedef' : 'Hedefi Düzenle'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            <TextField
              {...register('name')}
              label="Hedef Adı"
              autoFocus
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              {...register('weight')}
              type="number"
              label="Ağırlık"
              fullWidth
              error={!!errors.weight}
              helperText={errors.weight?.message}
            />
            <Typography variant="body2" color={projectedTotal > 100 ? 'error' : 'text.secondary'}>
              Toplam ağırlık: {projectedTotal}/100
            </Typography>
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
