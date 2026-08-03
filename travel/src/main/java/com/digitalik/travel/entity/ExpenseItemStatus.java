package com.digitalik.travel.entity;

import com.digitalik.core.approval.ApprovalStatus;

/**
 * US-08B.1.3: Masraf kaleminin onay durumu — {@code leave.LeaveRequestStatus}'taki aynı desen.
 *
 * <p>Bölüm 9.2 kısmi sadeleştirmesi: {@link ApprovalStatus} uygulanır —
 * bkz. o arayüzün javadoc'u.
 */
public enum ExpenseItemStatus implements ApprovalStatus {
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
