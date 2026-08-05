import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type DetailFieldProps = {
  label: string
  value: string
}

// Bölüm 13.7'de EmployeeDetailPage'e özgü yerel bir bileşendi; Bölüm 14.1'de
// ProfilePage'in AYNI ihtiyacıyla (salt-okunur etiket+değer çifti) 2. gerçek
// kullanımına ulaşınca paylaşılan hale getirildi (bkz. Bölüm 9: shared
// component'ler ilk gerçek ihtiyaçta/tekrarında oluşturulur).
export function DetailField({ label, value }: DetailFieldProps) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Stack>
  )
}
