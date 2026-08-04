import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

type ToastSeverity = 'success' | 'error' | 'info' | 'warning'
type ToastState = { message: string; severity: ToastSeverity; key: number } | null

type ToastContextValue = {
  showToast: (message: string, severity?: ToastSeverity) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

// Bölüm 9: Toast (Snackbar) — "Başarı/hata bildirimleri (ör. 'Çalışan
// oluşturuldu')" — tek global kuyruk, her modül kendi Snackbar'ını KURMAZ.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null)

  const showToast = useCallback((message: string, severity: ToastSeverity = 'success') => {
    setToast({ message, severity, key: Date.now() })
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        key={toast?.key}
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast ? (
          <Alert onClose={() => setToast(null)} severity={toast.severity} variant="filled" sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast, ToastProvider içinde kullanılmalıdır.')
  }
  return context
}
