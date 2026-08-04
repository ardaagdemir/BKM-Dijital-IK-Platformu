import type { OrganizationUnit } from '../types'

export type UnitTreeNode = OrganizationUnit & {
  children: UnitTreeNode[]
}

function isPartOfCycle(id: number, rawById: Map<number, OrganizationUnit>): boolean {
  const seen = new Set<number>()
  let currentId: number | null = id
  while (currentId !== null) {
    if (seen.has(currentId)) {
      return true
    }
    seen.add(currentId)
    currentId = rawById.get(currentId)?.parentId ?? null
  }
  return false
}

// Backend `GET /api/organization/units` DÜZ liste döner (bkz. types.ts) —
// ağaca dönüştürme TAMAMEN client-side yapılır. Var olmayan bir `parentId`'ye
// işaret eden veya döngüsel bir referansın PARÇASI olan birimler, sonsuz
// döngüye/veri kaybına yol AÇMAMAK için KÖK olarak ele alınır.
export function buildUnitTree(units: OrganizationUnit[]): UnitTreeNode[] {
  const rawById = new Map<number, OrganizationUnit>(units.map((unit) => [unit.id, unit]))
  const nodesById = new Map<number, UnitTreeNode>(units.map((unit) => [unit.id, { ...unit, children: [] }]))
  const roots: UnitTreeNode[] = []

  for (const unit of units) {
    const node = nodesById.get(unit.id)
    if (!node) {
      continue
    }
    const hasValidParent = unit.parentId !== null && nodesById.has(unit.parentId)
    if (hasValidParent && !isPartOfCycle(unit.id, rawById)) {
      nodesById.get(unit.parentId as number)?.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

// CreateUnitDialog'daki "Üst Birim" seçicisi için — girinti derinliğiyle
// birlikte düz bir liste (bkz. UnitTreeDesktop'un AYNI yapıyı görsel ağaç
// olarak render etmesiyle KARIŞTIRILMASIN, bu yalnızca <Select> seçenekleri
// içindir).
export function flattenTreeForSelect(
  nodes: UnitTreeNode[],
  depth = 0,
): { id: number; name: string; depth: number }[] {
  return nodes.flatMap((node) => [
    { id: node.id, name: node.name, depth },
    ...flattenTreeForSelect(node.children, depth + 1),
  ])
}
