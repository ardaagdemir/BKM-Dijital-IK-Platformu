import { describe, expect, it } from 'vitest'
import { filterNavItemsByRoles, type NavItem } from './navigation'

const icon = null as unknown as NavItem['icon']

const items: NavItem[] = [
  { label: 'Herkese Açık', path: '/ortak', icon },
  { label: 'Yalnızca Admin', path: '/admin', icon, roles: ['ADMIN'] },
  { label: 'Admin veya İK', path: '/admin-ik', icon, roles: ['ADMIN', 'IK'] },
]

describe('filterNavItemsByRoles', () => {
  it('roles belirtilmeyen öğeleri her role gösterir', () => {
    const result = filterNavItemsByRoles(items, ['CALISAN'])

    expect(result.map((item) => item.path)).toEqual(['/ortak'])
  })

  it('roles kesişmeyen öğeleri gizler, kesişenleri gösterir', () => {
    const result = filterNavItemsByRoles(items, ['IK'])

    expect(result.map((item) => item.path)).toEqual(['/ortak', '/admin-ik'])
  })

  it('birden çok role sahip kullanıcı için tüm eşleşen öğeleri döner', () => {
    const result = filterNavItemsByRoles(items, ['ADMIN'])

    expect(result.map((item) => item.path)).toEqual(['/ortak', '/admin', '/admin-ik'])
  })

  it('rolü olmayan kullanıcı için yalnızca herkese açık öğeleri döner', () => {
    const result = filterNavItemsByRoles(items, [])

    expect(result.map((item) => item.path)).toEqual(['/ortak'])
  })
})
