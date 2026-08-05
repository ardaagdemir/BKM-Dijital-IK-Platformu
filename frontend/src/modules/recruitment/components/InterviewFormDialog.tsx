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
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { interviewSchema, type InterviewFormValues } from '../schema'

type InterviewFormDialogProps = {
  open: boolean
  submitting: boolean
  errorMessage: string | null
  onSubmit: (values: InterviewFormValues) => void
  onClose: () => void
}

// `organization.AssetFormDialog`'daki AYNI iskelet — tarih + iki metin alanı.
export function InterviewFormDialog({ open, submitting, errorMessage, onSubmit, onClose }: InterviewFormDialogProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewSchema),
    defaultValues: { interviewDate: '', participants: '', result: '' },
  })

  useEffect(() => {
    if (open) {
      reset({ interviewDate: '', participants: '', result: '' })
    }
  }, [open, reset])

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="xs" fullWidth>
      <DialogTitle>Yeni Mülakat Kaydı</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            <Controller
              control={control}
              name="interviewDate"
              render={({ field, fieldState }) => (
                <DatePicker
                  label="Mülakat Tarihi"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => field.onChange(date?.isValid() ? date.format('YYYY-MM-DD') : '')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!fieldState.error,
                      helperText: fieldState.error?.message,
                    },
                  }}
                />
              )}
            />
            <TextField
              {...register('participants')}
              label="Katılımcılar"
              fullWidth
              error={!!errors.participants}
              helperText={errors.participants?.message}
            />
            <TextField
              {...register('result')}
              label="Sonuç"
              multiline
              rows={2}
              fullWidth
              error={!!errors.result}
              helperText={errors.result?.message}
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
