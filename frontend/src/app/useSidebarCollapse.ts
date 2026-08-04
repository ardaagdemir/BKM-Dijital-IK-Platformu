import { useCallback, useState } from 'react'
import { SIDEBAR_COLLAPSED_STORAGE_KEY } from './layout.constants'

// Bölüm 4.1: "Kullanıcı sidebar'ı manuel daraltıp yalnızca ikon bırakabilir
// (tercih localStorage'a yazılır)."
export function useSidebarCollapse() {
  const [collapsed, setCollapsed] = useState<boolean>(
    () => window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === '1',
  )

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, next ? '1' : '0')
      return next
    })
  }, [])

  return { collapsed, toggle }
}
