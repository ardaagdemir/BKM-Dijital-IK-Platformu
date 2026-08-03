package com.digitalik.attendance.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalTime;

/**
 * US-07.1.1: Çalışma modeli (ör. "Tam Zamanlı", "Vardiyalı") —
 * {@code organization.JobTitle}'daki AYNI bağımsız, tekil referans listesi
 * deseni. Kabul kriterindeki "çalışana atanabilir" ifadesi İLERİYE DÖNÜK bir
 * gerekçe — atamanın kendisi US-07.1.2'de; bu story yalnızca modelin
 * TANIMLANMASINI kapsıyor (bkz. {@code performance.RatingScale}'daki aynı
 * "ileriye dönük gerekçe" desenindeki emsal).
 *
 * <p>{@code plannedStartTime}/{@code plannedEndTime} (US-07.2.2, V37):
 * planlanan vardiya saatleri — fiili giriş-çıkışla (bkz. {@link AttendanceRecord})
 * karşılaştırmak için.
 */
@Entity
@Table(name = "work_models")
public class WorkModel extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private LocalTime plannedStartTime;

    @Column(nullable = false)
    private LocalTime plannedEndTime;

    protected WorkModel() {
        // JPA için
    }

    public WorkModel(String name, LocalTime plannedStartTime, LocalTime plannedEndTime) {
        this.name = name;
        this.plannedStartTime = plannedStartTime;
        this.plannedEndTime = plannedEndTime;
    }

    public String getName() {
        return name;
    }

    public LocalTime getPlannedStartTime() {
        return plannedStartTime;
    }

    public LocalTime getPlannedEndTime() {
        return plannedEndTime;
    }

    public void update(String name, LocalTime plannedStartTime, LocalTime plannedEndTime) {
        this.name = name;
        this.plannedStartTime = plannedStartTime;
        this.plannedEndTime = plannedEndTime;
    }
}
