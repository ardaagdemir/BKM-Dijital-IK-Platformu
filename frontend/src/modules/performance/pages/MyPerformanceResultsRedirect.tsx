import { Navigate } from 'react-router-dom'
import { ApiError } from '../../../shared/api/ApiError'
import { EmptyState } from '../../../shared/components/EmptyState'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { useMyEmployee } from '../../organization/api/useMyEmployee'

// US-06.3.1: roadmap'in rotası `/performance/results/:employeeId` — leave/
// balance'ın AKSİNE (id'siz, dahili çözümleme) BURADA id URL'DE. "Herkes
// kendi sonuçlarını görür" kabul kriterinin bir giriş noktasına ihtiyacı
// var; bu KÜÇÜK yönlendirme sayfası `/employees/me` ile kendi id'sini çözüp
// asıl sonuç sayfasına YÖNLENDİRİR (nav menüsündeki "Performans Sonuçlarım").
export function MyPerformanceResultsRedirect() {
  const { data: employee, isPending, isError, error } = useMyEmployee()
  const employeeMissing = isError && error instanceof ApiError && error.status === 404

  if (isPending) {
    return (
      <>
        <PageHeader title="Performans Sonuçlarım" />
        <LoadingSkeleton rows={4} />
      </>
    )
  }

  if (employeeMissing) {
    return (
      <>
        <PageHeader title="Performans Sonuçlarım" />
        <EmptyState message="Sisteme bağlı bir çalışan kaydınız bulunamadı." />
      </>
    )
  }

  if (isError || !employee) {
    return <ErrorState message="Çalışan bilgileri yüklenemedi." onRetry={() => window.location.reload()} />
  }

  return <Navigate to={`/performance/results/${employee.id}`} replace />
}
