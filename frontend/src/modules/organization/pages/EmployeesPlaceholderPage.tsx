import AddIcon from '@mui/icons-material/Add'
import Typography from '@mui/material/Typography'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../../shared/components/PageHeader'

// Bölüm 13.6 Kapsam notu: çalışan LİSTESİ (tablo/kart, filtre, sayfalama)
// AYRI bir bölüm — bu, yalnızca 13.5'in "+ Yeni Çalışan" giriş noktasının
// gerçek/tıklanabilir bir yerde durabilmesi için minimal bir yer tutucudur
// (bkz. HomePlaceholder'daki AYNI desen).
export function EmployeesPlaceholderPage() {
  const navigate = useNavigate()

  return (
    <>
      <PageHeader
        title="Çalışanlar"
        action={{ label: 'Yeni Çalışan', icon: <AddIcon />, onClick: () => navigate('/organization/employees/new') }}
      />
      <Typography color="text.secondary">Çalışan listesi ilerleyen bir bölümde eklenecek.</Typography>
    </>
  )
}
