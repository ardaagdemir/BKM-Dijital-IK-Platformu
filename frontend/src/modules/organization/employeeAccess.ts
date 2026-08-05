// Bölüm 13.7 — backend'in `GET /employees/{id}` üzerindeki
// `hasAnyRole('ADMIN','IK') or isSelf` kuralı yalnızca GÖRÜNTÜLEMEYİ
// belirler; "kendi kaydı" da olsa DÜZENLEME/ATAMA yalnızca ADMIN/IK'ya
// açıktır (bkz. roadmap'in "Rol bazlı erişim" notu) — bu yüzden burada
// isSelf/CALISAN AYRIMI YOK, tek karar "ADMIN veya IK mi?". Bir CALISAN'ın
// kendi kaydına erişimi zaten backend'in isSelf kontrolüyle sağlanır (bu
// sayfa yalnızca 200 döndüğünde render edilir); başkasının kaydına erişim
// backend'de 403 ile reddedilir ve bu sayfaya HİÇ ulaşılmaz.
export function canEditEmployee(roles: string[]): boolean {
  return roles.includes('ADMIN') || roles.includes('IK')
}
