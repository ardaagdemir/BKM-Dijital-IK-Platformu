import Typography from '@mui/material/Typography'

/**
 * Geçici ana sayfa içeriği — gerçek gösterge paneli henüz roadmap'te ayrı
 * bir story değil. Marka/kimlik artık AppShell'de (Sidebar/NavDrawer başlığı)
 * gösterildiğinden bu sayfa yalnızca kendi başlığını taşır.
 */
export function HomePlaceholder() {
  return (
    <>
      <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
        Ana Sayfa
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Hoş geldiniz. Gösterge paneli içeriği ilerleyen bir story'de eklenecek.
      </Typography>
    </>
  )
}
