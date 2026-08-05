import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'

type ReturnAssetDialogProps = {
  open: boolean
  itemName: string
  returnedAt: string
  onReturnedAtChange: (value: string) => void
  submitting: boolean
  errorMessage: string | null
  onConfirm: () => void
  onCancel: () => void
}

export function ReturnAssetDialog({
  open,
  itemName,
  returnedAt,
  onReturnedAtChange,
  submitting,
  errorMessage,
  onConfirm,
  onCancel,
}: ReturnAssetDialogProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Dialog open={open} onClose={onCancel} fullScreen={fullScreen} maxWidth="xs" fullWidth>
      <DialogTitle>Zimmeti İade Al</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 0.5 }}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          <DialogContentText>{itemName}</DialogContentText>
          <DatePicker
            label="İade Tarihi"
            value={returnedAt ? dayjs(returnedAt) : null}
            onChange={(date) => onReturnedAtChange(date?.isValid() ? date.format('YYYY-MM-DD') : '')}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={submitting}>
          Vazgeç
        </Button>
        <Button onClick={onConfirm} variant="contained" loading={submitting} disabled={!returnedAt}>
          İade Al
        </Button>
      </DialogActions>
    </Dialog>
  )
}
