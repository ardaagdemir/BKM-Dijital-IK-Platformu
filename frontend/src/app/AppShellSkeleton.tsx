import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { FullHeightBox } from './FullHeightBox'
import { SIDEBAR_WIDTH_RAIL, TOPBAR_HEIGHT } from './layout.constants'

// Bölüm 13.2 Durumlar/Loading: "AppShell'in kendi iskeleti" — çerçeve
// yüklenmeden içerik yanıp sönmesin diye AppShell'in KENDİ şeklini taklit
// eder (genel bir spinner DEĞİL).
export function AppShellSkeleton() {
  return (
    <FullHeightBox style={{ display: 'flex' }}>
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          width: SIDEBAR_WIDTH_RAIL,
          flexShrink: 0,
          borderRight: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Skeleton variant="rectangular" height={TOPBAR_HEIGHT} />
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Skeleton variant="rectangular" height={TOPBAR_HEIGHT} />
        <Stack spacing={2} sx={{ p: 3 }}>
          <Skeleton variant="rounded" height={32} width="40%" />
          <Skeleton variant="rounded" height={120} />
          <Skeleton variant="rounded" height={120} />
        </Stack>
      </Box>
    </FullHeightBox>
  )
}
