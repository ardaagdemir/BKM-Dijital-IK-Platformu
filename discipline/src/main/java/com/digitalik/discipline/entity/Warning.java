package com.digitalik.discipline.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDate;

/**
 * US-08C.1.1: Bir çalışana verilen uyarı kaydı (tarih, sebep, açıklama).
 * Kabul kriteri yalnızca "Kayıt çalışana bağlanır" diyor — FR-1301'in
 * "veren kişi/kategori/ek belge/çalışan savunması/geçerlilik süresi"
 * zenginliği BİLİNÇLİ OLARAK taşınmadı (roadmap story metninde
 * İSTENMEDİĞİNDEN).
 *
 * <p>{@code employeeId}, {@code organization.Employee}'ye DB seviyesinde bir
 * FK İLE değil düz bir {@code Long} olarak tutulur — {@code leave}/{@code
 * performance}/{@code attendance}/{@code training}/{@code travel}'daki AYNI
 * modüller-arası güven sınırı gerekçesi.
 */
@Entity
@Table(name = "warnings")
public class Warning extends BaseEntity {

    @Column(nullable = false)
    private Long employeeId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private String reason;

    @Column(nullable = false)
    private String description;

    protected Warning() {
        // JPA için
    }

    public Warning(Long employeeId, LocalDate date, String reason, String description) {
        this.employeeId = employeeId;
        this.date = date;
        this.reason = reason;
        this.description = description;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public LocalDate getDate() {
        return date;
    }

    public String getReason() {
        return reason;
    }

    public String getDescription() {
        return description;
    }
}
