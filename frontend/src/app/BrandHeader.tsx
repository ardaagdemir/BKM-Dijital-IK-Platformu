import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { TOPBAR_HEIGHT } from './layout.constants'

export function BrandHeader({ compact = false }: { compact?: boolean }) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        height: TOPBAR_HEIGHT,
        px: compact ? 0 : 2.5,
        alignItems: 'center',
        justifyContent: compact ? 'center' : 'flex-start',
      }}
    >
      <BusinessCenterOutlinedIcon color="primary" />
      {!compact && (
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', lineHeight: 1.1 }}>
          Dijital İK
        </Typography>
      )}
    </Stack>
  )
}
