import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AccordionList, type AccordionListColumn } from '../../../shared/components/AccordionList'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { Pagination } from '../../../shared/components/Pagination'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import { useAuditLog } from '../api/useAuditLog'
import {
  DEFAULT_AUDIT_LOG_LIST_FILTERS,
  buildAuditLogListSearchParams,
  isValidDateRange,
  parseAuditLogListFilters,
  type AuditLogListFilters,
} from '../auditListParams'
import { KNOWN_ENTITY_TYPES } from '../entityTypes'
import type { AuditLogEntry, AuditOperation } from '../types'

const OPERATION_LABELS: Record<AuditOperation, string> = {
  CREATE: 'Oluşturma',
  UPDATE: 'Güncelleme',
}

function formatDateTime(iso: string): string {
  return dayjs(iso).format('DD.MM.YYYY HH:mm')
}

function formatTime(iso: string): string {
  return dayjs(iso).format('HH:mm')
}

function toDateOrNull(value: string) {
  return value ? dayjs(value) : null
}

export function AuditLogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = parseAuditLogListFilters(searchParams)

  const [performedByInput, setPerformedByInput] = useState(filters.performedBy)
  const debouncedPerformedBy = useDebouncedValue(performedByInput, 400)
  const isFirstRender = useRef(true)

  function commitFilters(partial: Partial<Omit<AuditLogListFilters, 'page'>>) {
    setSearchParams(buildAuditLogListSearchParams({ ...filters, ...partial, page: 0 }), { replace: true })
  }

  // Bölüm 13.8: "Kullanıcı (arama)" — 13.6'daki İsim aramasıyla AYNI
  // debounce deseni (400ms).
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    commitFilters({ performedBy: debouncedPerformedBy })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedPerformedBy])

  function setPage(page: number) {
    setSearchParams(buildAuditLogListSearchParams({ ...filters, page }), { replace: true })
  }

  function clearAllFilters() {
    setPerformedByInput('')
    setSearchParams(buildAuditLogListSearchParams(DEFAULT_AUDIT_LOG_LIST_FILTERS), { replace: true })
  }

  const hasActiveFilters = !!filters.entityType || !!filters.performedBy || !!filters.from || !!filters.to
  const dateRangeValid = isValidDateRange(filters.from, filters.to)

  const queryParams = {
    entityType: filters.entityType || undefined,
    performedBy: filters.performedBy || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
    page: filters.page,
  }

  const { data, isPending, isError, refetch, isPlaceholderData } = useAuditLog(queryParams, dateRangeValid)

  const columns: AccordionListColumn<AuditLogEntry>[] = useMemo(
    () => [
      { key: 'performedAt', header: 'Tarih/Saat', render: (row) => formatDateTime(row.performedAt) },
      { key: 'performedBy', header: 'Kullanıcı', render: (row) => row.performedBy },
      { key: 'entityType', header: 'Varlık Türü', render: (row) => row.entityType },
      { key: 'entityId', header: 'Varlık ID', render: (row) => row.entityId },
      { key: 'operation', header: 'İşlem', render: (row) => OPERATION_LABELS[row.operation] },
    ],
    [],
  )

  return (
    <>
      <PageHeader title="Audit Kayıtları" />

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1}
        sx={{ mb: 2, alignItems: { xs: 'stretch', md: 'center' } }}
      >
        <TextField
          size="small"
          label="Kullanıcı ara"
          placeholder="Kullanıcı ara"
          value={performedByInput}
          onChange={(event) => setPerformedByInput(event.target.value)}
          fullWidth
        />
        <TextField
          select
          size="small"
          label="Varlık Türü"
          value={filters.entityType}
          onChange={(event) => commitFilters({ entityType: event.target.value })}
          fullWidth
          sx={{ minWidth: { md: 200 } }}
        >
          <MenuItem value="">Tümü</MenuItem>
          {KNOWN_ENTITY_TYPES.map((entityType) => (
            <MenuItem key={entityType} value={entityType}>
              {entityType}
            </MenuItem>
          ))}
        </TextField>
        <DatePicker
          label="Başlangıç"
          value={toDateOrNull(filters.from)}
          onChange={(date) => commitFilters({ from: date?.isValid() ? date.format('YYYY-MM-DD') : '' })}
          slotProps={{ textField: { size: 'small', fullWidth: true } }}
        />
        <DatePicker
          label="Bitiş"
          value={toDateOrNull(filters.to)}
          onChange={(date) => commitFilters({ to: date?.isValid() ? date.format('YYYY-MM-DD') : '' })}
          slotProps={{ textField: { size: 'small', fullWidth: true } }}
        />
        {hasActiveFilters && (
          <Button size="small" onClick={clearAllFilters} sx={{ flexShrink: 0 }}>
            Filtreleri Temizle
          </Button>
        )}
      </Stack>

      {!dateRangeValid && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Bitiş tarihi başlangıç tarihinden önce olamaz.
        </Alert>
      )}

      {dateRangeValid && isPending && <LoadingSkeleton rows={5} />}
      {dateRangeValid && isError && <ErrorState message="Audit kayıtları yüklenemedi." onRetry={() => refetch()} />}
      {dateRangeValid && !isPending && !isError && data?.content.length === 0 && (
        <EmptyState message="Bu kriterlere uygun audit kaydı yok." />
      )}
      {dateRangeValid && !isPending && !isError && !!data?.content.length && (
        <>
          <Box sx={{ opacity: isPlaceholderData ? 0.5 : 1, transition: 'opacity 0.15s' }}>
            <AccordionList
              columns={columns}
              rows={data.content}
              getRowKey={(row) => row.id}
              renderSummary={(row) => (
                <Typography variant="body2">
                  {formatTime(row.performedAt)} · {row.performedBy} · {row.entityType} #{row.entityId} ·{' '}
                  {OPERATION_LABELS[row.operation]}
                </Typography>
              )}
              renderDetail={(row) => (
                <Stack spacing={0.5}>
                  <Typography variant="body2">Tarih/Saat: {formatDateTime(row.performedAt)}</Typography>
                  <Typography variant="body2">Kullanıcı: {row.performedBy}</Typography>
                  <Typography variant="body2">
                    Varlık: {row.entityType} #{row.entityId}
                  </Typography>
                  <Typography variant="body2">İşlem: {OPERATION_LABELS[row.operation]}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Alan bazlı değişiklik detayı henüz mevcut değil.
                  </Typography>
                </Stack>
              )}
            />
          </Box>
          <Pagination
            page={data.page.number}
            totalPages={data.page.totalPages}
            totalElements={data.page.totalElements}
            onChange={setPage}
          />
        </>
      )}
    </>
  )
}
