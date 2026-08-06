import { describe, expect, it } from 'vitest'
import { filterNavItemsByRoles, getBottomNavItems, groupNavItems, type NavItem } from './navigation'

const icon = null as unknown as NavItem['icon']

const items: NavItem[] = [
  { label: 'Herkese Açık', path: '/ortak', icon, group: 'Genel' },
  { label: 'Yalnızca Admin', path: '/admin', icon, group: 'Yönetim', roles: ['ADMIN'] },
  { label: 'Admin veya İK', path: '/admin-ik', icon, group: 'Yönetim', roles: ['ADMIN', 'IK'] },
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

describe('groupNavItems', () => {
  it('öğeleri NAV_GROUPS sırasına göre gruplar, boş grupları atlar', () => {
    const grouped = groupNavItems(items)

    expect(grouped.map((entry) => entry.group)).toEqual(['Genel', 'Yönetim'])
    expect(grouped[0].items.map((item) => item.path)).toEqual(['/ortak'])
    expect(grouped[1].items.map((item) => item.path)).toEqual(['/admin', '/admin-ik'])
  })

  it('hiç öğe kalmayınca boş dizi döner', () => {
    expect(groupNavItems([])).toEqual([])
  })
})

describe('getBottomNavItems', () => {
  const homeItem: NavItem = { label: 'Ana Sayfa', path: '/', icon, group: 'Genel' }
  const employeesItem: NavItem = {
    label: 'Çalışanlar',
    path: '/organization/employees',
    icon,
    group: 'Organizasyon',
    roles: ['ADMIN', 'IK'],
  }
  const leaveRequestsItem: NavItem = { label: 'İzin Taleplerim', path: '/leave/requests', icon, group: 'Çalışan İşlemleri' }
  const leaveApprovalsItem: NavItem = {
    label: 'Onay Bekleyenler',
    path: '/leave/approvals',
    icon,
    group: 'İK Süreçleri',
    roles: ['YONETICI'],
  }

  it('sabit hedefleri KISA etiketle döner, sırayı korur', () => {
    const result = getBottomNavItems([homeItem, employeesItem, leaveRequestsItem, leaveApprovalsItem])

    expect(result.map((item) => ({ path: item.path, label: item.label }))).toEqual([
      { path: '/', label: 'Ana Sayfa' },
      { path: '/organization/employees', label: 'Çalışanlar' },
      { path: '/leave/requests', label: 'İzinler' },
      { path: '/leave/approvals', label: 'Onaylar' },
    ])
  })

  it('rol filtresinden geçmediği için `items` içinde bulunmayan bir hedefi ATLAR', () => {
    // `leaveApprovalsItem` YOK — CALISAN gibi bir rol için `filterNavItemsByRoles`
    // zaten elemiş olacağı senaryo simüle ediliyor.
    const result = getBottomNavItems([homeItem, leaveRequestsItem])

    expect(result.map((item) => item.path)).toEqual(['/', '/leave/requests'])
    expect(result).toHaveLength(2)
  })

  it('hiçbir hedef bulunamazsa boş dizi döner', () => {
    expect(getBottomNavItems([])).toEqual([])
  })
})
