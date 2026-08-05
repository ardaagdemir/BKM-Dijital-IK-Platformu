// Bölüm 14.2 (US-03.4.1) — backend `endDate` null döndüğünde bu kayıt HÂLÂ
// AÇIK (güncel atama) demektir; liste ZATEN startDate DESC (en yeni önce)
// sıralı geldiğinden frontend AYRICA sıralama YAPMAZ.
export function formatAssignmentEndDate(endDate: string | null): string {
  return endDate ?? 'Halen Aktif'
}
