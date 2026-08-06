import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import dayjs from 'dayjs'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { appointmentSlotSchema, type AppointmentSlotFormValues } from '../schema'

type AppointmentSlotFormDialogProps = {
  open: boolean
  submitting: boolean
  errorMessage: string | null
  onSubmit: (values: AppointmentSlotFormValues) => void
  onClose: () => void
}

const EMPTY_VALUES: AppointmentSlotFormValues = { startTime: '', endTime: '' }

// US-08H.1.1: Slot tanımlama — çakışma engelleme HATASI backend'den
// gelen `errorMessage`'da gösterilir, istemci tarafında AYRICA bir
// çakışma ön-kontrolü YAPILMAZ (mevcut slotları TARAMAK yerine backend'in
// tek gerçek kaynağına güvenilir).
export function AppointmentSlotFormDialog({
  open,
  submitting,
  errorMessage,
  onSubmit,
  onClose,
}: AppointmentSlotFormDialogProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const { control, handleSubmit, reset } = useForm<AppointmentSlotFormValues>({
    resolver: zodResolver(appointmentSlotSchema),
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    if (open) {
      reset(EMPTY_VALUES)
    }
  }, [open, reset])

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="xs" fullWidth>
      <DialogTitle>Yeni Slot</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            <Controller
              control={control}
              name="startTime"
              render={({ field, fieldState }) => (
                <DateTimePicker
                  label="Başlangıç"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => field.onChange(date?.isValid() ? date.toISOString() : '')}
                  slotProps={{
                    textField: { fullWidth: true, error: !!fieldState.error, helperText: fieldState.error?.message },
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="endTime"
              render={({ field, fieldState }) => (
                <DateTimePicker
                  label="Bitiş"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => field.onChange(date?.isValid() ? date.toISOString() : '')}
                  slotProps={{
                    textField: { fullWidth: true, error: !!fieldState.error, helperText: fieldState.error?.message },
                  }}
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            Vazgeç
          </Button>
          <Button type="submit" variant="contained" loading={submitting}>
            Oluştur
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
