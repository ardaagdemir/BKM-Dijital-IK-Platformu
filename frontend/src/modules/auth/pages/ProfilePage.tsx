import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { DetailField } from '../../../shared/components/DetailField'
import { PageHeader } from '../../../shared/components/PageHeader'
import { useAuth } from '../AuthProvider'

// Bölüm 14.1 (US-02.2.4): "kendi ad/e-posta/rol bilgisi, salt-okunur kart."
// `useAuth().user` zaten giriş/oturum-doğrulama sırasında `GET /api/auth/me`
// ile doldurulmuş durumda (bkz. AuthProvider.tsx) — ayrı bir API çağrısına
// GEREK YOK.
export function ProfilePage() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  return (
    <>
      <PageHeader title="Profilim" />
      <Paper sx={{ p: { xs: 2, sm: 3 }, maxWidth: 480 }}>
        <Stack spacing={2.5}>
          <DetailField label="Ad Soyad" value={user.fullName} />
          <DetailField label="E-posta" value={user.email} />
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Roller
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
              {user.roles.map((role) => (
                <Chip key={role} label={role} size="small" variant="outlined" />
              ))}
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </>
  )
}
