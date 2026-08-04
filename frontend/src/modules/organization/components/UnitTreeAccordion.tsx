import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { UnitTreeNode } from '../utils/buildUnitTree'

type UnitTreeAccordionProps = {
  nodes: UnitTreeNode[]
  matchingIds: Set<number>
  expandedIds: Set<number>
  onToggle: (id: number) => void
}

function UnitAccordionNode({
  node,
  matchingIds,
  expandedIds,
  onToggle,
}: {
  node: UnitTreeNode
  matchingIds: Set<number>
  expandedIds: Set<number>
  onToggle: (id: number) => void
}) {
  const matched = matchingIds.has(node.id)

  if (node.children.length === 0) {
    return (
      <Box sx={{ py: 1, px: 2 }}>
        <Typography sx={matched ? { fontWeight: 700, color: 'primary.main' } : undefined}>{node.name}</Typography>
      </Box>
    )
  }

  return (
    <Accordion
      disableGutters
      expanded={expandedIds.has(node.id)}
      onChange={() => onToggle(node.id)}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography sx={matched ? { fontWeight: 700, color: 'primary.main' } : undefined}>{node.name}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ pl: 2 }}>
        {node.children.map((child) => (
          <UnitAccordionNode
            key={child.id}
            node={child}
            matchingIds={matchingIds}
            expandedIds={expandedIds}
            onToggle={onToggle}
          />
        ))}
      </AccordionDetails>
    </Accordion>
  )
}

// Bölüm 13.4: "mobilde AYNI ağaç ama her düğüm AccordionList deseniyle
// (ağaç yapısı zaten 'kart'a dönüşmeye uygun değil, accordion doğru
// dönüşüm)" — bkz. 2.3 istisnası.
export function UnitTreeAccordion({ nodes, matchingIds, expandedIds, onToggle }: UnitTreeAccordionProps) {
  return (
    <Box aria-label="Organizasyon birimleri ağacı">
      {nodes.map((node) => (
        <UnitAccordionNode key={node.id} node={node} matchingIds={matchingIds} expandedIds={expandedIds} onToggle={onToggle} />
      ))}
    </Box>
  )
}
