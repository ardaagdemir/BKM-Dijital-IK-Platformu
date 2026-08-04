import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

export type ResponsiveTableColumn<T> = {
  key: string
  header: string
  render: (row: T) => ReactNode
  // Mobil kart görünümünde BAŞLIK olarak kullanılan alan (bkz. Bölüm 2.3).
  // Belirtilmezse ilk sütun kullanılır.
  primary?: boolean
}

type ResponsiveTableProps<T> = {
  columns: ResponsiveTableColumn<T>[]
  rows: T[]
  getRowKey: (row: T) => string | number
  actions?: (row: T) => ReactNode
  // Bölüm 13.6: "bir satıra tıklayınca detay sayfasına gider" (masaüstü) /
  // "kart tamamı tıklanabilir" (mobil) — asıl klavye/ekran okuyucu
  // erişilebilir navigasyonu SAĞLAMAZ (bunun için bir sütun içinde gerçek
  // bir <Link> render edilmeli); bu yalnızca fare/dokunma KOLAYLIĞI katar.
  onRowClick?: (row: T) => void
}

// Bölüm 2.3 / Bölüm 9: masaüstünde tablo, xs/sm'de kart listesi — davranış
// TEK bu component'te kapsüllenir, her modül kendi tablo/kart geçiş
// mantığını YENİDEN YAZMAZ.
export function ResponsiveTable<T>({ columns, rows, getRowKey, actions, onRowClick }: ResponsiveTableProps<T>) {
  const primaryColumn = columns.find((column) => column.primary) ?? columns[0]
  const secondaryColumns = columns.filter((column) => column !== primaryColumn)

  return (
    <>
      <TableContainer sx={{ display: { xs: 'none', md: 'block' } }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.key}>{column.header}</TableCell>
              ))}
              {actions && <TableCell align="right">Aksiyonlar</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={getRowKey(row)}
                hover
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                sx={{ cursor: onRowClick ? 'pointer' : undefined }}
              >
                {columns.map((column) => (
                  <TableCell key={column.key}>{column.render(row)}</TableCell>
                ))}
                {actions && (
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      {actions(row)}
                    </Stack>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' } }}>
        {rows.map((row) => (
          <Card
            key={getRowKey(row)}
            variant="outlined"
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            sx={{ cursor: onRowClick ? 'pointer' : undefined }}
          >
            <CardContent>
              {primaryColumn && <Typography variant="subtitle1">{primaryColumn.render(row)}</Typography>}
              {secondaryColumns.map((column) => (
                <Box key={column.key} sx={{ mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {column.header}:{' '}
                  </Typography>
                  <Typography variant="body2" component="span">
                    {column.render(row)}
                  </Typography>
                </Box>
              ))}
            </CardContent>
            {actions && <CardActions sx={{ justifyContent: 'flex-end' }}>{actions(row)}</CardActions>}
          </Card>
        ))}
      </Stack>
    </>
  )
}
