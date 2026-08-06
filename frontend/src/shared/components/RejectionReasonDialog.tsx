import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// Backend'in AYNI mesajıyla BİREBİR (bkz. ApprovalDecisionValidator.validate).
export const rejectionReasonSchema = z.object({
  rejectionReason: z.string().min(1, 'Ret gerekçesi zorunludur.'),
})

export type RejectionReasonFormValues = z.infer<typeof rejectionReasonSchema>

type RejectionReasonDialogProps = {
  open: boolean
  title?: string
  employeeLabel: string
  submitting: boolean
  errorMessage: string | null
  onSubmit: (values: RejectionReasonFormValues) => void
  onCancel: () => void
}

// `leave.RejectLeaveRequestDialog`/`training.RejectEnrollmentDialog`'un 3.
// gerçek ihtiyaçta (kulüp üyelik talebi) ORTAK bileşene taşınmış hali —
// Bölüm 9'un "Nth gerçek ihtiyaçta paylaşılan hale getir" deseni (bkz.
// `EmployeeAutocomplete`/`StatusChip`'teki AYNI karar).
export function RejectionReasonDialog({
  open,
  title = 'Talebi Reddet',
  employeeLabel,
  submitting,
  errorMessage,
  onSubmit,
  onCancel,
}: RejectionReasonDialogProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejectionReasonFormValues>({
    resolver: zodResolver(rejectionReasonSchema),
    defaultValues: { rejectionReason: '' },
  })

  useEffect(() => {
    if (open) {
      reset({ rejectionReason: '' })
    }
  }, [open, reset])

  return (
    <Dialog open={open} onClose={onCancel} fullScreen={fullScreen} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            <DialogContentText>{employeeLabel}</DialogContentText>
            <TextField
              {...register('rejectionReason')}
              label="Ret Gerekçesi"
              autoFocus
              fullWidth
              multiline
              rows={2}
              error={!!errors.rejectionReason}
              helperText={errors.rejectionReason?.message}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel} disabled={submitting}>
            Vazgeç
          </Button>
          <Button type="submit" color="error" variant="contained" loading={submitting}>
            Reddet
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
