import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { FilterBar } from '../../../shared/components/FilterBar'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { ResponsiveTable, type ResponsiveTableColumn } from '../../../shared/components/ResponsiveTable'
import { StatusChip } from '../../../shared/components/StatusChip'
import { useCandidates } from '../api/useCandidates'
import { CANDIDATE_STAGE_LABELS } from '../statusLabels'
import type { Candidate, CandidateStage } from '../types'

const STAGE_OPTIONS: { value: CandidateStage; label: string }[] = [
  { value: 'APPLICATION', label: 'Başvuru' },
  { value: 'INTERVIEW', label: 'Mülakat' },
  { value: 'OFFER', label: 'Teklif' },
  { value: 'HIRED', label: 'İşe Alındı' },
  { value: 'REJECTED', label: 'Reddedildi' },
]

// US-05.2.1/US-05.2.2: Aday listesi — isim/pozisyona göre arama + aşama
// filtresi TAMAMEN istemci tarafında (bkz. `leave.LeaveRequestsPage`'deki
// AYNI desen; backend'de bu ekran için ayrı bir filtre parametresi yok).
export function CandidatesPage() {
  const navigate = useNavigate()
  const { data: candidates, isPending, isError, refetch } = useCandidates()

  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('')

  const filtered = useMemo(() => {
    if (!candidates) {
      return []
    }
    const term = search.trim().toLocaleLowerCase('tr')
    return candidates.filter((candidate) => {
      const matchesSearch =
        !term ||
        `${candidate.firstName} ${candidate.lastName}`.toLocaleLowerCase('tr').includes(term) ||
        candidate.appliedPosition.toLocaleLowerCase('tr').includes(term)
      const matchesStage = !stageFilter || candidate.stage === stageFilter
      return matchesSearch && matchesStage
    })
  }, [candidates, search, stageFilter])

  const columns: ResponsiveTableColumn<Candidate>[] = [
    { key: 'name', header: 'Ad Soyad', render: (row) => `${row.firstName} ${row.lastName}`, primary: true },
    { key: 'appliedPosition', header: 'Başvurulan Pozisyon', render: (row) => row.appliedPosition },
    {
      key: 'stage',
      header: 'Aşama',
      render: (row) => <StatusChip {...CANDIDATE_STAGE_LABELS[row.stage]} />,
    },
  ]

  return (
    <>
      <PageHeader title="Adaylar" />

      {!!candidates?.length && (
        <FilterBar
          value={search}
          onChange={setSearch}
          placeholder="İsim veya pozisyon ara"
          label="İsim veya pozisyon ara"
          onClearAll={() => {
            setSearch('')
            setStageFilter('')
          }}
          selects={[
            {
              label: 'Aşama',
              value: stageFilter,
              options: STAGE_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
              onChange: setStageFilter,
            },
          ]}
        />
      )}

      {isPending && <LoadingSkeleton rows={5} />}
      {isError && <ErrorState message="Adaylar yüklenemedi." onRetry={() => refetch()} />}
      {!isPending && !isError && candidates?.length === 0 && <EmptyState message="Henüz bir başvuru yok." />}
      {!isPending && !isError && !!candidates?.length && filtered.length === 0 && (
        <EmptyState message="Bu filtrelere uygun aday bulunamadı." />
      )}
      {!isPending && !isError && filtered.length > 0 && (
        <ResponsiveTable
          columns={columns}
          rows={filtered}
          getRowKey={(row) => row.id}
          onRowClick={(row) => navigate(`/recruitment/candidates/${row.id}`)}
        />
      )}
    </>
  )
}
