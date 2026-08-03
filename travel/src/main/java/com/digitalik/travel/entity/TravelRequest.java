package com.digitalik.travel.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDate;

/**
 * US-08B.1.1: Bir çalışanın seyahat talebi (lokasyon, tarih aralığı, amaç).
 * Kabul kriteri yalnızca "Form kaydedilir" diyor — bir onay akışı BU
 * STORY'DE YOK (bkz. roadmap US-08B.1.3, masraf beyanı onayı; seyahat
 * talebinin kendisi için ayrı bir onay adımı tanımlanmadı).
 *
 * <p>{@code employeeId}, {@code organization.Employee}'ye DB seviyesinde bir
 * FK İLE değil düz bir {@code Long} olarak tutulur — {@code leave}/{@code
 * performance}/{@code attendance}/{@code training}'teki AYNI modüller-arası
 * güven sınırı gerekçesi.
 */
@Entity
@Table(name = "travel_requests")
public class TravelRequest extends BaseEntity {

    @Column(nullable = false)
    private Long employeeId;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private String purpose;

    protected TravelRequest() {
        // JPA için
    }

    public TravelRequest(Long employeeId, String location, LocalDate startDate, LocalDate endDate, String purpose) {
        this.employeeId = employeeId;
        this.location = location;
        this.startDate = startDate;
        this.endDate = endDate;
        this.purpose = purpose;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public String getLocation() {
        return location;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public String getPurpose() {
        return purpose;
    }
}
