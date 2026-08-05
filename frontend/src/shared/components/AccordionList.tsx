import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import type { ReactNode } from 'react'

export type AccordionListColumn<T> = {
  key: string
  header: string
  render: (row: T) => ReactNode
}

type AccordionListProps<T> = {
  columns: AccordionListColumn<T>[]
  rows: T[]
  getRowKey: (row: T) => string | number
  // Mobilde her satırın accordion BAŞLIĞI (her zaman görünür, ör. "14:32 ·
  // Ahmet Yılmaz · Employee #12 · Güncelleme").
  renderSummary: (row: T) => ReactNode
  // Mobilde genişletilince görünen İÇERİK.
  renderDetail: (row: T) => ReactNode
}

// Bölüm 2.3 "detaylı kayıt" istisnası: `ResponsiveTable`'ın kart moduna
// ALTERNATİF — çok satır taranması gereken ama her satırın çok/uzun alanı
// olduğu durumlar için (ör. audit log, disiplin geçmişi) masaüstünde
// TABLO, mobilde her satır ayrı bir accordion (başlık her zaman görünür,
// detay tıklanınca açılır). İlk gerçek kullanımı 13.8 (Audit Kayıtları).
export function AccordionList<T>({ columns, rows, getRowKey, renderSummary, renderDetail }: AccordionListProps<T>) {
  return (
    <>
      <TableContainer sx={{ display: { xs: 'none', md: 'block' } }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.key}>{column.header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={getRowKey(row)} hover>
                {columns.map((column) => (
                  <TableCell key={column.key}>{column.render(row)}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {rows.map((row) => (
        <Accordion key={getRowKey(row)} disableGutters sx={{ display: { xs: 'block', md: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>{renderSummary(row)}</AccordionSummary>
          <AccordionDetails>{renderDetail(row)}</AccordionDetails>
        </Accordion>
      ))}
    </>
  )
}
