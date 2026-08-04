import Typography from '@mui/material/Typography'

// Bölüm 5.2: ProtectedRoute'un `roles` uyuşmazlığında yönlendirdiği sayfa.
export function Forbidden() {
  return (
    <>
      <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
        Yetkisiz Erişim
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Bu sayfayı görüntüleme yetkiniz yok.
      </Typography>
    </>
  )
}
