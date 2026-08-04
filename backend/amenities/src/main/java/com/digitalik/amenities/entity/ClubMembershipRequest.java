package com.digitalik.amenities.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

/**
 * US-08G.1.1: Bir çalışanın bir {@link Club}'a üyelik talebi. Kabul
 * kriteri: "Talep İK onayına gider." — {@code leave.LeaveRequest}/{@code
 * training.TrainingEnrollment}'daki AYNI "talep→onay" deseninin tekrar
 * kullanımı: {@code PENDING} ile oluşturulur, {@link #approve()}/{@link
 * #reject(String)} ile karara bağlanır. Onaylayan İK'dır (Kulüp Lideri
 * DEĞİL — o rol US-08G.1.2'de yalnızca ETKİNLİK oluşturma yetkisiyle
 * ilgili); bu nedenle {@code leave}/{@code performance}'taki "yalnızca
 * kendi ekibi" kısıtı BURADA GEÇERLİ DEĞİL.
 *
 * <p>{@code employeeId}, diğer tüm modüllerdeki AYNI modüller-arası güven
 * sınırı gerekçesiyle FK'siz düz bir {@code Long}; {@code clubId} ise AYNI
 * modül içindeki {@link Club}'a normal bir FK ile bağlı.
 */
@Entity
@Table(name = "club_membership_requests")
public class ClubMembershipRequest extends BaseEntity {

    @Column(nullable = false)
    private Long clubId;

    @Column(nullable = false)
    private Long employeeId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClubMembershipRequestStatus status;

    private String rejectionReason;

    protected ClubMembershipRequest() {
        // JPA için
    }

    public ClubMembershipRequest(Long clubId, Long employeeId) {
        this.clubId = clubId;
        this.employeeId = employeeId;
        this.status = ClubMembershipRequestStatus.PENDING;
    }

    public void approve() {
        this.status = ClubMembershipRequestStatus.APPROVED;
    }

    public void reject(String rejectionReason) {
        this.status = ClubMembershipRequestStatus.REJECTED;
        this.rejectionReason = rejectionReason;
    }

    public Long getClubId() {
        return clubId;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public ClubMembershipRequestStatus getStatus() {
        return status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }
}
