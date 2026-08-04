package com.digitalik.organization.entity;

import com.digitalik.core.entity.BaseEntity;
import com.digitalik.core.security.EncryptedBigDecimalConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * US-03.3.3: Çalışanın ücret/terfi geçmişindeki tek bir kayıt (ör. işe giriş
 * ücreti, yıllık zam, terfi ile birlikte gelen ücret artışı).
 *
 * <p>{@link EmployeeAsset}'in aksine burada bir durum değişikliği (iade gibi)
 * YOK — kabul kriteri ("yeni kayıt eskisini silmez") gereği bu kayıt SALT-EKLEME
 * (append-only) ve DEĞİŞMEZ: oluşturulduktan sonra güncelleme/silme metodu
 * kasıtlı olarak tanımlanmadı.
 *
 * <p>US-09.9.1: {@code amount}, {@link EncryptedBigDecimalConverter} ile DB'de
 * şifreli saklanıyor. Bu alan hiçbir yerde DB seviyesinde toplanmıyor/filtrelenmiyor
 * (bkz. {@code payroll.PayrollConsolidationService} — kayıtları tek tek okur,
 * SQL SUM/WHERE kullanmaz), bu yüzden şifrelemek güvenli.
 */
@Entity
@Table(name = "employee_salary_records")
public class EmployeeSalaryRecord extends BaseEntity {

    @Column(nullable = false)
    private Long employeeId;

    @Convert(converter = EncryptedBigDecimalConverter.class)
    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate effectiveDate;

    @Column
    private String reason;

    protected EmployeeSalaryRecord() {
        // JPA için
    }

    public EmployeeSalaryRecord(Long employeeId, BigDecimal amount, LocalDate effectiveDate, String reason) {
        this.employeeId = employeeId;
        this.amount = amount;
        this.effectiveDate = effectiveDate;
        this.reason = reason;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public LocalDate getEffectiveDate() {
        return effectiveDate;
    }

    public String getReason() {
        return reason;
    }
}
