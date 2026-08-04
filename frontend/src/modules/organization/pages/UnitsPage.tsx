import AddIcon from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import { useEffect, useMemo, useState } from 'react'
import { ApiError } from '../../../shared/api/ApiError'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { FilterBar } from '../../../shared/components/FilterBar'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { useToast } from '../../../shared/components/ToastProvider'
import { useCreateUnit } from '../api/useCreateUnit'
import { useUnits } from '../api/useUnits'
import { CreateUnitDialog } from '../components/CreateUnitDialog'
import { UnitTreeAccordion } from '../components/UnitTreeAccordion'
import { UnitTreeDesktop } from '../components/UnitTreeDesktop'
import type { UnitFormValues } from '../schema'
import { buildUnitTree, type UnitTreeNode } from '../utils/buildUnitTree'

function collectAncestorIds(nodeId: number, tree: UnitTreeNode[]): number[] {
  const ancestors: number[] = []

  function walk(nodes: UnitTreeNode[], path: number[]): boolean {
    for (const node of nodes) {
      if (node.id === nodeId) {
        ancestors.push(...path)
        return true
      }
      if (walk(node.children, [...path, node.id])) {
        return true
      }
    }
    return false
  }

  walk(tree, [])
  return ancestors
}

export function UnitsPage() {
  const { data: units, isPending, isError, refetch } = useUnits()
  const createUnit = useCreateUnit()
  const { showToast } = useToast()

  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

  const tree = useMemo(() => buildUnitTree(units ?? []), [units])

  const matchingIds = useMemo(() => {
    if (!search.trim()) {
      return new Set<number>()
    }
    const term = search.trim().toLocaleLowerCase('tr')
    return new Set((units ?? []).filter((unit) => unit.name.toLocaleLowerCase('tr').includes(term)).map((unit) => unit.id))
  }, [units, search])

  // Bölüm 13.4: "eşleşen düğümler + üst zincirleri vurgulanır/genişletilir."
  useEffect(() => {
    if (matchingIds.size === 0) {
      return
    }
    const ancestorIds = new Set<number>()
    matchingIds.forEach((id) => {
      collectAncestorIds(id, tree).forEach((ancestorId) => ancestorIds.add(ancestorId))
    })
    setExpandedItems((prev) => Array.from(new Set([...prev, ...Array.from(ancestorIds, String)])))
    setExpandedIds((prev) => new Set([...prev, ...ancestorIds]))
  }, [matchingIds, tree])

  function handleToggleAccordion(id: number) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function openDialog() {
    setSubmitError(null)
    setDialogOpen(true)
  }

  async function handleCreate(values: UnitFormValues) {
    setSubmitError(null)
    try {
      await createUnit.mutateAsync(values)
      setDialogOpen(false)
      showToast('Birim oluşturuldu')
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.detail : 'Beklenmeyen bir hata oluştu, tekrar deneyin.')
    }
  }

  return (
    <>
      <PageHeader
        title="Organizasyon Birimleri"
        action={{ label: 'Yeni Birim', icon: <AddIcon />, onClick: openDialog }}
      />

      {!!units?.length && <FilterBar value={search} onChange={setSearch} placeholder="Birim ara" label="Birim ara" />}

      {isPending && <LoadingSkeleton rows={5} />}
      {isError && <ErrorState message="Birimler yüklenemedi." onRetry={() => refetch()} />}
      {!isPending && !isError && units?.length === 0 && (
        <EmptyState
          message="Henüz bir organizasyon birimi tanımlanmadı."
          action={{ label: 'İlk Birimi Oluştur', onClick: openDialog }}
        />
      )}
      {!isPending && !isError && !!units?.length && (
        <>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <UnitTreeDesktop
              nodes={tree}
              matchingIds={matchingIds}
              expandedItems={expandedItems}
              onExpandedItemsChange={setExpandedItems}
            />
          </Box>
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <UnitTreeAccordion
              nodes={tree}
              matchingIds={matchingIds}
              expandedIds={expandedIds}
              onToggle={handleToggleAccordion}
            />
          </Box>
        </>
      )}

      <CreateUnitDialog
        open={dialogOpen}
        tree={tree}
        submitting={createUnit.isPending}
        errorMessage={submitError}
        onSubmit={handleCreate}
        onClose={() => setDialogOpen(false)}
      />
    </>
  )
}
