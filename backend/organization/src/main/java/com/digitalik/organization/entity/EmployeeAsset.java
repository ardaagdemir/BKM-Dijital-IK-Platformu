package com.digitalik.organization.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDate;

/**
 * US-03.3.2: Çalışana teslim edilen bir zimmet kalemi (ör. dizüstü bilgisayar,
 * telefon). {@link EmployeeProfile}'ın aksine {@code employeeId} burada
 * UNIQUE DEĞİL — kabul kriteri ("birden fazla kalem") gereği bir çalışanın
 * birden fazla zimmet kaydı olabilir.
 *
 * <p>{@code returnedAt} null iken kalem hâlâ çalışanda demektir; iade
 * edildiğinde {@link #markReturned(LocalDate)} ile doldurulur. Fiziksel silme
 * yok — teslim/iade GEÇMİŞİNİN korunması kabul kriterinin doğrudan gereği.
 */
@Entity
@Table(name = "employee_assets")
public class EmployeeAsset extends BaseEntity {

    @Column(nullable = false)
    private Long employeeId;

    @Column(nullable = false)
    private String itemName;

    @Column(nullable = false)
    private LocalDate deliveredAt;

    @Column
    private LocalDate returnedAt;

    protected EmployeeAsset() {
        // JPA için
    }

    public EmployeeAsset(Long employeeId, String itemName, LocalDate deliveredAt) {
        this.employeeId = employeeId;
        this.itemName = itemName;
        this.deliveredAt = deliveredAt;
    }

    public void markReturned(LocalDate returnedAt) {
        this.returnedAt = returnedAt;
    }

    public boolean isReturned() {
        return returnedAt != null;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public String getItemName() {
        return itemName;
    }

    public LocalDate getDeliveredAt() {
        return deliveredAt;
    }

    public LocalDate getReturnedAt() {
        return returnedAt;
    }
}
