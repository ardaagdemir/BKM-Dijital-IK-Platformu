import { describe, expect, it } from 'vitest'
import type { OrganizationUnit } from '../types'
import { buildUnitTree } from './buildUnitTree'

describe('buildUnitTree', () => {
  it('boş liste için boş dizi döner', () => {
    expect(buildUnitTree([])).toEqual([])
  })

  it('çoklu kökü doğru işler', () => {
    const units: OrganizationUnit[] = [
      { id: 1, name: 'İK', parentId: null },
      { id: 2, name: 'Mühendislik', parentId: null },
    ]

    const tree = buildUnitTree(units)

    expect(tree).toHaveLength(2)
    expect(tree.map((node) => node.name)).toEqual(['İK', 'Mühendislik'])
  })

  it('alt birimleri doğru üst birimin children dizisine yerleştirir', () => {
    const units: OrganizationUnit[] = [
      { id: 1, name: 'İK', parentId: null },
      { id: 2, name: 'İşe Alım', parentId: 1 },
      { id: 3, name: 'Bordro', parentId: 1 },
    ]

    const tree = buildUnitTree(units)

    expect(tree).toHaveLength(1)
    expect(tree[0].children.map((child) => child.name).sort()).toEqual(['Bordro', 'İşe Alım'])
  })

  it('var olmayan parentId işaret eden birimi kök olarak ele alır', () => {
    const units: OrganizationUnit[] = [{ id: 1, name: 'Yetim Birim', parentId: 999 }]

    const tree = buildUnitTree(units)

    expect(tree).toHaveLength(1)
    expect(tree[0].name).toBe('Yetim Birim')
  })

  it('döngüsel referansı sonsuz döngüye girmeden köklere ayırır', () => {
    const units: OrganizationUnit[] = [
      { id: 1, name: 'A', parentId: 2 },
      { id: 2, name: 'B', parentId: 1 },
    ]

    const tree = buildUnitTree(units)

    expect(tree).toHaveLength(2)
    expect(tree.every((node) => node.children.length === 0)).toBe(true)
  })

  it('kendi kendine referans veren birimi kök olarak ele alır', () => {
    const units: OrganizationUnit[] = [{ id: 1, name: 'Kendine Bağlı', parentId: 1 }]

    const tree = buildUnitTree(units)

    expect(tree).toHaveLength(1)
    expect(tree[0].children).toHaveLength(0)
  })
})
