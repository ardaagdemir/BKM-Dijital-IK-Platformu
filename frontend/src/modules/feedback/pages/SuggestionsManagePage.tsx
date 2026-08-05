import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { useMemo, useState } from 'react'
import { ApiError } from '../../../shared/api/ApiError'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../../shared/components/ResponsiveTable'
import { useToast } from '../../../shared/components/ToastProvider'
import { useSuggestionCategories } from '../api/useSuggestionCategories'
import { useSuggestions } from '../api/useSuggestions'
import { useUpdateSuggestionStatus } from '../api/useUpdateSuggestionStatus'
import { SUGGESTION_STATUS_LABELS } from '../statusLabels'
import type { Suggestion, SuggestionStatus } from '../types'

const STATUS_OPTIONS: SuggestionStatus[] = ['PENDING', 'APPROVED', 'COMPLETED']

// US-08F.1.2: `employeeId` parametresi VERİLMEDEN çağrılır — TÜM talepler
// (anonim dahil, `employeeId: null`) döner (bkz. SuggestionService.list).
export function SuggestionsManagePage() {
  const { showToast } = useToast()
  const { data: suggestions, isPending, isError, refetch } = useSuggestions()
  const { data: categories } = useSuggestionCategories()
  const categoryNameById = useMemo(() => new Map((categories ?? []).map((c) => [c.id, c.name])), [categories])
  const updateStatus = useUpdateSuggestionStatus()
  const [rowError, setRowError] = useState<string | null>(null)

  async function handleStatusChange(id: number, status: string) {
    setRowError(null)
    try {
      await updateStatus.mutateAsync({ id, status })
      showToast('Durum güncellendi')
    } catch (error) {
      setRowError(error instanceof ApiError ? error.detail : 'Durum güncellenemedi, tekrar deneyin.')
    }
  }

  const columns: ResponsiveTableColumn<Suggestion>[] = [
    { key: 'category', header: 'Kategori', primary: true, render: (row) => categoryNameById.get(row.categoryId) ?? '—' },
    { key: 'employee', header: 'Çalışan', render: (row) => (row.employeeId === null ? 'Anonim' : `#${row.employeeId}`) },
    { key: 'description', header: 'Açıklama', render: (row) => row.description },
    {
      key: 'status',
      header: 'Durum',
      render: (row) => (
        <Select
          size="small"
          value={row.status}
          onChange={(event) => handleStatusChange(row.id, event.target.value)}
          inputProps={{ 'aria-label': `${row.description} durumu` }}
        >
          {STATUS_OPTIONS.map((status) => (
            <MenuItem key={status} value={status}>
              {SUGGESTION_STATUS_LABELS[status].label}
            </MenuItem>
          ))}
        </Select>
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Talep Yönetimi" />

      {rowError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {rowError}
        </Alert>
      )}
      {isPending && <LoadingSkeleton rows={5} />}
      {isError && <ErrorState message="Talepler yüklenemedi." onRetry={() => refetch()} />}
      {!isPending && !isError && suggestions?.length === 0 && <EmptyState message="Henüz gönderilmiş bir talep yok." />}
      {!isPending && !isError && !!suggestions?.length && (
        <ResponsiveTable columns={columns} rows={suggestions} getRowKey={(row) => row.id} />
      )}
    </>
  )
}
