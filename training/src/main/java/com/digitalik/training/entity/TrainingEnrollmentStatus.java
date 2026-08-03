package com.digitalik.training.entity;

import com.digitalik.core.approval.ApprovalStatus;

/**
 * US-08A.1.2: Eğitim talebinin durumu (bekliyor/onaylı/reddedildi) —
 * {@code leave.LeaveRequestStatus}'taki aynı desen.
 *
 * <p>US-08A.1.3: {@code COMPLETED}, yalnızca {@code APPROVED} bir talepten
 * geçilebilen dördüncü bir durum — "onaylandı" (katılım izni) ile
 * "tamamlandı" (gerçekten katılım sağlandı) kavramsal olarak farklı.
 *
 * <p>Bölüm 9.2 kısmi sadeleştirmesi: {@link ApprovalStatus} uygulanır —
 * {@code COMPLETED} için üçü de {@code false} döner, bu durum {@code
 * decide(...)}'ın (yalnızca PENDING/APPROVED/REJECTED ile ilgilenen)
 * kapsamı dışında; bkz. o arayüzün javadoc'u.
 */
public enum TrainingEnrollmentStatus implements ApprovalStatus {
    PENDING,
    APPROVED,
    REJECTED,
    COMPLETED;

    @Override
    public boolean isPending() {
        return this == PENDING;
    }

    @Override
    public boolean isApproved() {
        return this == APPROVED;
    }

    @Override
    public boolean isRejected() {
        return this == REJECTED;
    }
}
