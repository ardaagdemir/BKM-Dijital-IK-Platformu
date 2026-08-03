package com.digitalik.amenities.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

/**
 * US-08H.1.1: Bir {@link ServiceOffering} için uygun bir saat slotu.
 * Kabul kriteri: "Slot çakışması engellenir" — {@code
 * AppointmentSlotService.create}'te, AYNI hizmet için var olan slotlarla
 * zaman aralığı KESİŞEN yeni bir slot reddedilir.
 *
 * <p>{@code startTime}/{@code endTime} — {@code attendance.AttendanceRecord}'daki
 * (US-07.2.1) AYNI {@code OffsetDateTime} deseni (zaman DİLİMİ farkında
 * kesin an, saat bazlı çakışma karşılaştırması için gerekli).
 */
@Entity
@Table(name = "appointment_slots")
public class AppointmentSlot extends BaseEntity {

    @Column(nullable = false)
    private Long serviceOfferingId;

    @Column(nullable = false)
    private OffsetDateTime startTime;

    @Column(nullable = false)
    private OffsetDateTime endTime;

    protected AppointmentSlot() {
        // JPA için
    }

    public AppointmentSlot(Long serviceOfferingId, OffsetDateTime startTime, OffsetDateTime endTime) {
        this.serviceOfferingId = serviceOfferingId;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public Long getServiceOfferingId() {
        return serviceOfferingId;
    }

    public OffsetDateTime getStartTime() {
        return startTime;
    }

    public OffsetDateTime getEndTime() {
        return endTime;
    }
}
