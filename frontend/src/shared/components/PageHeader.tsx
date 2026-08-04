import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  action?: { label: string; onClick: () => void; icon?: ReactNode }
}

export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', mb: 3 }}
    >
      <Typography variant="h4" component="h1">
        {title}
      </Typography>
      {action && (
        <Button variant="contained" startIcon={action.icon} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Stack>
  )
}
