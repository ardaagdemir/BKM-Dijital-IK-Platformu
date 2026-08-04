package com.digitalik.core.approval;

/**
 * Bölüm 9.2 (Merkezi Onay Motoru) kısmi sadeleştirmesi: {@code
 * leave.LeaveRequestStatus}/{@code training.TrainingEnrollmentStatus}/
 * {@code travel.ExpenseItemStatus}/{@code club.ClubMembershipRequestStatus}'un
 * dördü de aynı üç durumu (PENDING/APPROVED/REJECTED) taşıyan, birbirinden
 * bağımsız yazılmış enum'lardı — bu arayüz, o dört enum'un ortak "durum
 * sorgulama" davranışını tek bir tipte toplar ki {@link ApprovalDecisionValidator}
 * hepsine karşı jenerik çalışabilsin.
 *
 * <p><b>Tam bir "Onay Motoru" DEĞİL:</b> roadmap'in Bölüm 9.2'de tarif ettiği
 * (yapılandırılabilir çok seviyeli zincirler, kod yazmadan tanımlama, UI)
 * kapsamın bilinçli olarak küçük bir alt kümesi — yalnızca dört modülde
 * GERÇEKTEN birebir tekrarlanan doğrulama mantığını (bkz. {@link
 * ApprovalDecisionValidator}) tek yere taşır. Modüllerin kendi entity/repository/
 * exception/controller yapısı DEĞİŞMEDİ; yalnızca {@code decide(...)}
 * metotlarının içindeki üç `if` kontrolü ortaklaştırıldı.
 *
 * <p>{@code training.TrainingEnrollmentStatus} gibi üçten fazla değere sahip
 * enum'lar için de sorunsuz çalışır — {@code COMPLETED} gibi ek değerler
 * yalnızca {@code isPending()}/{@code isApproved()}/{@code isRejected()}'in
 * hepsinden {@code false} döner.
 */
public interface ApprovalStatus {

    boolean isPending();

    boolean isApproved();

    boolean isRejected();
}
