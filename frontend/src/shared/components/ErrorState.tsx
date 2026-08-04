import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type ErrorStateProps = {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Stack spacing={2} sx={{ py: 8, textAlign: 'center', alignItems: 'center' }}>
      <ErrorOutlineOutlinedIcon sx={{ fontSize: 40, color: 'error.main' }} />
      <Typography color="text.secondary">{message}</Typography>
      {onRetry && (
        <Button variant="outlined" onClick={onRetry}>
          Tekrar Dene
        </Button>
      )}
    </Stack>
  )
}
