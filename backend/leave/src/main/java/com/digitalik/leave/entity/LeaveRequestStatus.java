package com.digitalik.leave.entity;

import com.digitalik.core.approval.ApprovalStatus;

/**
 * US-04.2.1/US-04.2.4: İzin talebinin durumu (bekliyor/onaylı/reddedildi).
 *
 * <p>Bölüm 9.2 kısmi sadeleştirmesi: {@link ApprovalStatus} uygulanır —
 * bkz. o arayüzün javadoc'u.
 */
public enum LeaveRequestStatus implements ApprovalStatus {
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
