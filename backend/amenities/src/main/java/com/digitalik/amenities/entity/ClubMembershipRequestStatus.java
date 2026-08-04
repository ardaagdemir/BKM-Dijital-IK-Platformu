package com.digitalik.amenities.entity;

import com.digitalik.core.approval.ApprovalStatus;

/**
 * US-08G.1.1: {@code leave.LeaveRequestStatus}/{@code training.TrainingEnrollmentStatus}'daki AYNI "talep→onay" durum kümesi.
 *
 * <p>Bölüm 9.2 kısmi sadeleştirmesi: {@link ApprovalStatus} uygulanır —
 * bkz. o arayüzün javadoc'u.
 */
public enum ClubMembershipRequestStatus implements ApprovalStatus {
    PENDING,
    APPROVED,
    REJECTED;

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
