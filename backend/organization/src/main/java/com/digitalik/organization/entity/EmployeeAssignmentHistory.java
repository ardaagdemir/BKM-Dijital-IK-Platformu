package com.digitalik.organization.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDate;

/**
 * US-03.4.1: Bir çalışanın belirli bir dönemdeki birim+unvan ataması.
 * {@code endDate} null iken bu, ÇALIŞANIN GÜNCEL ataması demektir (bkz.
 * {@link Employee#getOrganizationUnitId()}/{@link Employee#getJobTitleId()}
 * ile senkron tutulur — bkz. {@code EmployeeService.assign}). Yeni bir
 * atama yapıldığında ÖNCEKİ açık kayıt kapatılır ({@code endDate} doldurulur)
 * ve YENİ bir kayıt açılır — kayıtlar hiçbir zaman güncellenmez/silinmez,
 * yalnızca kapatılır + yenisi eklenir.
 *
 * <p>Kabul kriterindeki "tam etkin-tarihli mimari henüz kurulmaz" notuyla
 * tutarlı olarak, {@code startDate} her zaman değişikliğin YAPILDIĞI an
 * ({@code LocalDate.now()}) — gelecek tarihli planlama (ör. "1 ay sonra
 * geçerli olacak atama") desteklenmiyor.
 */
@Entity
@Table(name = "employee_assignment_history")
public class EmployeeAssignmentHistory extends BaseEntity {

    @Column(nullable = false)
    private Long employeeId;

    @Column(nullable = false)
    private Long organizationUnitId;

    @Column(nullable = false)
    private Long jobTitleId;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column
    private LocalDate endDate;

    protected EmployeeAssignmentHistory() {
        // JPA için
    }

    public EmployeeAssignmentHistory(Long employeeId, Long organizationUnitId, Long jobTitleId, LocalDate startDate) {
        this.employeeId = employeeId;
        this.organizationUnitId = organizationUnitId;
        this.jobTitleId = jobTitleId;
        this.startDate = startDate;
    }

    public void close(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public Long getOrganizationUnitId() {
        return organizationUnitId;
    }

    public Long getJobTitleId() {
        return jobTitleId;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }
}
