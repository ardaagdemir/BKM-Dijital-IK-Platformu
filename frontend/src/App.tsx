import Container from '@mui/material/Container'
import CssBaseline from '@mui/material/CssBaseline'
import Typography from '@mui/material/Typography'

/**
 * US-01.1.2: Boş ana sayfa. MUI (component kütüphanesi) burada yalnızca
 * doğru şekilde bağlandığını göstermek için minimal kullanılır; gerçek
 * ekranlar Bölüm 2 (Kullanıcı Girişi) ile başlayarak eklenecektir.
 */
function App() {
  return (
    <>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Typography variant="h4" component="h1">
          Dijital İK Platformu
        </Typography>
      </Container>
    </>
  )
}

export default App
