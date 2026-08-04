import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../../../shared/api/ApiError'
import { ErrorState } from '../../../shared/components/ErrorState'
import { LoadingSkeleton } from '../../../shared/components/LoadingSkeleton'
import { PageHeader } from '../../../shared/components/PageHeader'
import { useEmployee } from '../api/useEmployee'

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Stack>
  )
}

// Bölüm 13.7 Kapsam notu: bu sayfa ORADA tam sekmeli düzenleme/atama
// görünümüne DÖNÜŞECEK — burada yalnızca 13.5'in "oluşturma sonrası detaya
// yönlendirme, girilen bilgiler orada görünür" kabul kriterini karşılayan
// MİNİMAL, salt-okunur bir görünüm var.
export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const employeeId = Number(id)
  const isValidId = Number.isFinite(employeeId)
  const { data: employee, isPending, isError, error, refetch } = useEmployee(employeeId)

  const notFound = !isValidId || (isError && error instanceof ApiError && error.status === 404)

  if (notFound) {
    return (
      <Stack spacing={2} sx={{ py: 8, alignItems: 'center', textAlign: 'center' }}>
        <Typography variant="h5" component="h1">
          Çalışan bulunamadı
        </Typography>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Geri Dön
        </Button>
      </Stack>
    )
  }

  if (isPending) {
    return (
      <>
        <PageHeader title="Çalışan" />
        <LoadingSkeleton rows={5} />
      </>
    )
  }

  if (isError) {
    return <ErrorState message="Çalışan yüklenemedi." onRetry={() => refetch()} />
  }

  return (
    <>
      <PageHeader title={`${employee.firstName} ${employee.lastName}`} />
      <Stack spacing={2.5} sx={{ maxWidth: 480 }}>
        <DetailField label="Ad" value={employee.firstName} />
        <DetailField label="Soyad" value={employee.lastName} />
        <DetailField label="TC Kimlik No" value={employee.nationalId} />
        <DetailField label="İşe Giriş Tarihi" value={employee.hireDate} />
        <DetailField label="E-posta" value={employee.email} />
      </Stack>
    </>
  )
}
