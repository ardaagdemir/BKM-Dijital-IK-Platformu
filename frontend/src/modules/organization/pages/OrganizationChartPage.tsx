import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView'
import { TreeItem } from '@mui/x-tree-view/TreeItem'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { useOrganizationChart } from '../api/useOrganizationChart'
import type { OrganizationChartNode } from '../types'

// US-08I.1.3: Organizasyon şeması — `organization.UnitTreeDesktop`'taki
// AYNI `SimpleTreeView`/`TreeItem` deseni, ek olarak her birimin altında
// çalışanlar YAPRAK düğüm olarak listelenir. Birim/çalışan `itemId`'leri
// AYNI sayı uzayını paylaşabileceğinden (`unit-{id}` / `emp-{id}`)
// ÖNEKLENİR — çakışma önlenir.
export function OrganizationChartPage() {
  const { data: chart, isPending, isError, refetch } = useOrganizationChart()

  if (isPending) {
    return (
      <>
        <PageHeader title="Organizasyon Şeması" />
        <LoadingSkeleton rows={6} />
      </>
    )
  }

  if (isError) {
    return <ErrorState message="Organizasyon şeması yüklenemedi." onRetry={() => refetch()} />
  }

  if (!chart || chart.length === 0) {
    return (
      <>
        <PageHeader title="Organizasyon Şeması" />
        <EmptyState message="Henüz bir organizasyon birimi tanımlanmadı." />
      </>
    )
  }

  function renderNode(node: OrganizationChartNode) {
    return (
      <TreeItem key={`unit-${node.id}`} itemId={`unit-${node.id}`} label={node.name}>
        {node.employees.map((employee) => (
          <TreeItem
            key={`emp-${employee.id}`}
            itemId={`emp-${employee.id}`}
            label={
              <Box component="span">
                {employee.firstName} {employee.lastName}
                {employee.jobTitleName && (
                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    ({employee.jobTitleName})
                  </Typography>
                )}
              </Box>
            }
          />
        ))}
        {node.children.map((child) => renderNode(child))}
      </TreeItem>
    )
  }

  return (
    <>
      <PageHeader title="Organizasyon Şeması" />
      <SimpleTreeView aria-label="Organizasyon şeması">{chart.map((node) => renderNode(node))}</SimpleTreeView>
    </>
  )
}
