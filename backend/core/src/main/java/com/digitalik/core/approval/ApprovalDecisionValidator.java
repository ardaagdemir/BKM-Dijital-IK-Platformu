package com.digitalik.core.approval;

/**
 * Bölüm 9.2 kısmi sadeleştirmesi — bkz. {@link ApprovalStatus} javadoc'undaki
 * gerekçe. {@code leave.LeaveRequestService.decide}/{@code
 * training.TrainingEnrollmentService.decide}/{@code
 * travel.ExpenseItemService.decide}/{@code
 * club.ClubMembershipRequestService.decide}'da BİREBİR AYNI (yalnızca
 * kopyala-yapıştır edilmiş) üç doğrulamayı tek yere toplar:
 *
 * <ol>
 *   <li>Karar yalnızca onay veya ret olabilir (üçüncü bir durum İSTENEMEZ).
 *   <li>Yalnızca bekleyen (PENDING) bir kayıt karara bağlanabilir.
 *   <li>Ret için gerekçe zorunludur.
 * </ol>
 *
 * <p>"Zaten karara bağlanmış" mesajı BİLİNÇLİ OLARAK parametre — dört
 * modülün üçü ("talep") ile {@code travel.ExpenseItemService} ("kalem")
 * FARKLI bir isim kullanıyor; bu metin farkını korumak (davranış/API
 * sözleşmesini DEĞİŞTİRMEMEK) için tek bir sabit metin YERİNE çağıran
 * tarafından sağlanan bir parametre tercih edildi.
 *
 * <p>Bulgu (sürprizli değil, ama not edilmeye değer): dört modülün de
 * {@code decide(...)} metodu, bu üç kontrol DIŞINDA farklı kalıyor —
 * repository/exception tipi, entity tipi, `save` çağrısı, decide SONRASI
 * yan etkiler (ör. {@code leave}'in bildirim gönderimi) hâlâ modülün
 * kendi sorumluluğunda. Bu sınıf yalnızca gerçekten AYNI olan parçayı
 * taşıyor — tüm `decide()` akışını soyutlamaya ÇALIŞMADI (bu, YAGNI'yi
 * ihlal eden, roadmap'in Bölüm 9.2'de tarif ettiği tam kapsamlı motora
 * erken geçiş olurdu).
 */
public final class ApprovalDecisionValidator {

    private ApprovalDecisionValidator() {
    }

    public static <S extends ApprovalStatus> void validate(
            S currentStatus, S decision, String rejectionReason, String alreadyDecidedMessage) {
        if (!decision.isApproved() && !decision.isRejected()) {
            throw new IllegalArgumentException("Karar yalnızca APPROVED veya REJECTED olabilir.");
        }
        if (!currentStatus.isPending()) {
            throw new IllegalArgumentException(alreadyDecidedMessage);
        }
        if (decision.isRejected() && (rejectionReason == null || rejectionReason.isBlank())) {
            throw new IllegalArgumentException("Ret gerekçesi zorunludur.");
        }
    }
}
