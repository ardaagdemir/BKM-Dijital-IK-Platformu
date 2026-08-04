import { styled } from '@mui/material/styles'

// Bölüm 3: 100vh ÖNCE (eski tarayıcı fallback), 100dvh SONRA (destekleniyorsa
// kazanır) — styled() template literal'i CSS kademelemesini KORUR; sx
// nesnesinde aynı anahtarın iki kez yazılması JS düzeyinde SESSİZCE
// ÜZERİNE YAZAR (bkz. LoginPage.tsx'teki AYNI not).
export const FullHeightBox = styled('div')`
  min-height: 100vh;
  min-height: 100dvh;
`
