import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'

type LoadingSkeletonProps = {
  rows?: number
  rowHeight?: number
}

export function LoadingSkeleton({ rows = 4, rowHeight = 48 }: LoadingSkeletonProps) {
  return (
    <Stack spacing={1.5} aria-label="Yükleniyor">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} variant="rounded" height={rowHeight} />
      ))}
    </Stack>
  )
}
