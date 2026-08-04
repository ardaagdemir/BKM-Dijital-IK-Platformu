import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView'
import { TreeItem } from '@mui/x-tree-view/TreeItem'
import Box from '@mui/material/Box'
import type { UnitTreeNode } from '../utils/buildUnitTree'

type UnitTreeDesktopProps = {
  nodes: UnitTreeNode[]
  matchingIds: Set<number>
  expandedItems: string[]
  onExpandedItemsChange: (ids: string[]) => void
}

function UnitLabel({ name, matched }: { name: string; matched: boolean }) {
  return (
    <Box
      component="span"
      sx={matched ? { fontWeight: 700, color: 'primary.main' } : undefined}
    >
      {name}
    </Box>
  )
}

function renderNode(node: UnitTreeNode, matchingIds: Set<number>) {
  return (
    <TreeItem
      key={node.id}
      itemId={String(node.id)}
      label={<UnitLabel name={node.name} matched={matchingIds.has(node.id)} />}
    >
      {node.children.map((child) => renderNode(child, matchingIds))}
    </TreeItem>
  )
}

// Bölüm 13.4: "masaüstünde/tablette YATAY girintili ağaç görünümü."
export function UnitTreeDesktop({ nodes, matchingIds, expandedItems, onExpandedItemsChange }: UnitTreeDesktopProps) {
  return (
    <SimpleTreeView
      aria-label="Organizasyon birimleri ağacı"
      expandedItems={expandedItems}
      onExpandedItemsChange={(_event, ids) => onExpandedItemsChange(ids)}
    >
      {nodes.map((node) => renderNode(node, matchingIds))}
    </SimpleTreeView>
  )
}
