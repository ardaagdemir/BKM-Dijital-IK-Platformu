package com.digitalik.organization.entity;

import com.digitalik.core.entity.BaseEntity;
import com.digitalik.core.security.EncryptedStringConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDate;

/**
 * US-03.2.1: Bir çalışanın temel kaydı (ad-soyad, TC No, işe giriş tarihi,
 * iletişim).
 *
 * <p>US-09.9.1: {@code nationalId}, {@link EncryptedStringConverter} ile
 * DB'de şifreli saklanıyor — bkz. o sınıfın javadoc'u (deterministik
 * şifreleme, bu alanın DB {@code UNIQUE} kısıtı/{@code existsByNationalId}
 * eşitlik sorgusuyla uyumlu kalması için ZORUNLU).
 *
 * <p>US-03.2.2: {@code organizationUnitId}/{@code jobTitleId}, diğer
 * ilişkiler (bkz. {@link OrganizationUnit#getParentId()}) ile aynı
 * konvansiyonla düz birer yabancı anahtar — "GÜNCEL" atamayı tutar, geçmişi
 * DEĞİL. Atama değişikliklerinin geçmişe dönük izlenmesi (US-03.4.1'in
 * kabul kriteri) kasıtlı olarak burada kurulmadı; ihtiyaç netleşince ayrı bir
 * geçmiş tablosu olarak eklenecek (YAGNI) — bu alanların üzerine yazılması
 * (overwrite) bu story'nin kabul kriteri olan "atama sonradan
 * değiştirilebilir"i zaten karşılıyor.
 *
 * <p>Oluşturma/güncelleme audit_log kaydı, {@link BaseEntity} sayesinde ek bir
 * işlem gerektirmeden otomatik oluşur (US-03.2.4'ün kabul kriteri buradan
 * bedavaya sağlanır).
 */
@Entity
@Table(name = "employees")
public class Employee extends BaseEntity {

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(nullable = false, unique = true)
    private String nationalId;

    @Column(nullable = false)
    private LocalDate hireDate;

    @Column(nullable = false)
    private String email;

    @Column
    private Long organizationUnitId;

    @Column
    private Long jobTitleId;

    protected Employee() {
        // JPA için
    }

    public Employee(String firstName, String lastName, String nationalId, LocalDate hireDate, String email) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.nationalId = nationalId;
        this.hireDate = hireDate;
        this.email = email;
    }

    public void assign(Long organizationUnitId, Long jobTitleId) {
        this.organizationUnitId = organizationUnitId;
        this.jobTitleId = jobTitleId;
    }

    /** US-03.2.5: Temel bilgilerin (ad-soyad, TC No, işe giriş tarihi, iletişim) güncellenmesi. */
    public void update(String firstName, String lastName, String nationalId, LocalDate hireDate, String email) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.nationalId = nationalId;
        this.hireDate = hireDate;
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getNationalId() {
        return nationalId;
    }

    public LocalDate getHireDate() {
        return hireDate;
    }

    public String getEmail() {
        return email;
    }

    public Long getOrganizationUnitId() {
        return organizationUnitId;
    }

    public Long getJobTitleId() {
        return jobTitleId;
    }
}
