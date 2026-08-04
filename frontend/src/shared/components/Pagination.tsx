import MuiPagination from '@mui/material/Pagination'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type PaginationProps = {
  // Backend 0-indeksli (Spring Pageable) — MUI Pagination 1-indeksli;
  // dönüşüm BU component'in içinde yapılır, çağıran taraf backend'in
  // KENDİ indeksleme sözleşmesini kullanmaya devam eder.
  page: number
  totalPages: number
  totalElements: number
  onChange: (page: number) => void
}

// Bölüm 9: "Backend Pageable ile uyumlu sayfalama kontrolü."
export function Pagination({ page, totalPages, totalElements, onChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      sx={{ mt: 2, alignItems: 'center', justifyContent: 'space-between' }}
    >
      <Typography variant="body2" color="text.secondary">
        Toplam {totalElements} kayıt
      </Typography>
      <MuiPagination
        page={page + 1}
        count={totalPages}
        onChange={(_event, value) => onChange(value - 1)}
        color="primary"
        shape="rounded"
      />
    </Stack>
  )
}
