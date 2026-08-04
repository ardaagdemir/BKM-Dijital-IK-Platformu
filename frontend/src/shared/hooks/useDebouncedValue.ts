import { useEffect, useState } from 'react'

// Bölüm 1: "shared/hooks/ — useAuth, useMediaQuery sarmalayıcıları,
// useDebounce vb." — Bölüm 13.6'nın "İsim arama (debounced text input)"
// ihtiyacıyla İLK GERÇEK kullanımı.
export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
