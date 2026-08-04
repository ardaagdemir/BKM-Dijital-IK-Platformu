import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  loading?: boolean
  errorMessage?: string | null
  onConfirm: () => void
  onCancel: () => void
}

// Bölüm 9: "Geri alınamaz aksiyonlar (silme, reddetme) için onay modalı."
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Sil',
  loading = false,
  errorMessage,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const theme = useTheme()
  // Bölüm 2.4: "Modal/Dialog'lar xs'de tam ekran, sm+'de ortalanmış kutu."
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Dialog open={open} onClose={onCancel} fullScreen={fullScreen} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          Vazgeç
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" loading={loading}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
