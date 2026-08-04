import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type EmptyStateProps = {
  message: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <Stack spacing={2} sx={{ py: 8, textAlign: 'center', alignItems: 'center' }}>
      <InboxOutlinedIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
      <Typography color="text.secondary">{message}</Typography>
      {action && (
        <Button variant="outlined" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Stack>
  )
}
