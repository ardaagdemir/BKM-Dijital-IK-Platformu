package com.digitalik.organization.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDate;

/**
 * US-03.3.1: Çalışanın temel kaydından (bkz. {@link Employee}) AYRI, isteğe
 * bağlı bir "genişletilmiş özlük" formu — kimlik/adres/öğrenim/yabancı dil.
 * {@code employeeId}, projedeki diğer düz yabancı anahtarlarla aynı
 * konvansiyonu izler (bkz. {@link Employee#getOrganizationUnitId()}) ve 1:1
 * ilişkiyi DB seviyesinde {@code UNIQUE} kısıtıyla garanti eder.
 *
 * <p>Tüm alanlar isteğe bağlıdır (nullable) — kabul kriteri yalnızca "ayrı
 * bir sekme/form olarak eklenir ve güncellenebilir" diyor, zorunlu alan
 * gerektirmiyor; İK bu bilgileri zamanla, kademeli doldurabilir.
 *
 * <p>Öğrenim/yabancı dil alanları BİLİNÇLİ OLARAK çoklu-kayıt (liste) değil,
 * düz alanlardır — roadmap'in bu story'yi TEK bir form/sekme olarak
 * tanımlaması ("ayrı bir sekme/form", tekil) ile tutarlı. Çoklu öğrenim/dil
 * kaydı ihtiyacı netleşirse ayrı bir story olarak ele alınacak (YAGNI).
 */
@Entity
@Table(name = "employee_profiles")
public class EmployeeProfile extends BaseEntity {

    @Column(nullable = false, unique = true)
    private Long employeeId;

    @Column
    private LocalDate birthDate;

    @Column
    private String birthPlace;

    @Column
    private String gender;

    @Column
    private String city;

    @Column
    private String district;

    @Column
    private String addressLine;

    @Column
    private String educationLevel;

    @Column
    private String schoolName;

    @Column
    private Integer graduationYear;

    @Column
    private String foreignLanguage;

    @Column
    private String languageLevel;

    protected EmployeeProfile() {
        // JPA için
    }

    public EmployeeProfile(Long employeeId) {
        this.employeeId = employeeId;
    }

    public void update(
            LocalDate birthDate,
            String birthPlace,
            String gender,
            String city,
            String district,
            String addressLine,
            String educationLevel,
            String schoolName,
            Integer graduationYear,
            String foreignLanguage,
            String languageLevel) {
        this.birthDate = birthDate;
        this.birthPlace = birthPlace;
        this.gender = gender;
        this.city = city;
        this.district = district;
        this.addressLine = addressLine;
        this.educationLevel = educationLevel;
        this.schoolName = schoolName;
        this.graduationYear = graduationYear;
        this.foreignLanguage = foreignLanguage;
        this.languageLevel = languageLevel;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public String getBirthPlace() {
        return birthPlace;
    }

    public String getGender() {
        return gender;
    }

    public String getCity() {
        return city;
    }

    public String getDistrict() {
        return district;
    }

    public String getAddressLine() {
        return addressLine;
    }

    public String getEducationLevel() {
        return educationLevel;
    }

    public String getSchoolName() {
        return schoolName;
    }

    public Integer getGraduationYear() {
        return graduationYear;
    }

    public String getForeignLanguage() {
        return foreignLanguage;
    }

    public String getLanguageLevel() {
        return languageLevel;
    }
}
