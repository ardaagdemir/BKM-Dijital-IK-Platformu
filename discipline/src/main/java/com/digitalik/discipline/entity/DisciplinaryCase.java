package com.digitalik.discipline.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

/**
 * US-08C.1.2: Bir çalışana açılan ceza süreci — kabul kriteri yalnızca
 * "ceza sürecini kaydetmek" ve "çalışan savunması alınmadan süreç
 * kapanmamalı" diyor. FR-1304'ün "disiplin kuruluna sevk / kurul
 * değerlendirmesi / çok seviyeli onay / bildirim" zenginliği BİLİNÇLİ
 * OLARAK taşınmadı ({@link Warning}'daki (US-08C.1.1) AYNI roadmap'in
 * basitleştirilmiş kabul kriterini uygulama konvansiyonu).
 *
 * <p><b>US-08C.1.3 (SEC-021) — revizyon modeli:</b> Bir kez veritabanına
 * yazılan bir satır ARTIK ASLA {@code UPDATE} görmez. Süreç açılışı, savunma
 * kaydı ve kapatma; her biri {@link #open}/{@link #reviseWithDefense}/
 * {@link #reviseAsClosed} statik fabrikalarıyla ÖNCEKİ durumu miras alan
 * YENİ bir satır (revizyon) olarak eklenir — {@code
 * DisciplinaryCaseService} hiçbir zaman fetch edilmiş bir örneği mutasyona
 * uğratıp tekrar {@code save} etmez.
 *
 * <p>{@code caseId} bu revizyon zincirini gruplar: {@code NULL} ise bu satır
 * sürecin İLK (kök) revizyonudur — kendi id'si, sürecin ömrü boyunca
 * DEĞİŞMEYEN, dışarıya gösterilen "süreç id"sidir ({@link #rootCaseId()}).
 * Doluysa, işaret ettiği id kök revizyonun id'sidir.
 *
 * <p>{@code employeeId}, {@code organization.Employee}'ye DB seviyesinde
 * bir FK İLE değil düz bir {@code Long} olarak tutulur — diğer tüm
 * modüllerdeki AYNI modüller-arası güven sınırı gerekçesi.
 */
@Entity
@Table(name = "disciplinary_cases")
public class DisciplinaryCase extends BaseEntity {

    @Column(nullable = false)
    private Long employeeId;

    @Column(nullable = false)
    private String reason;

    private String defense;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DisciplinaryCaseStatus status;

    private Long caseId;

    protected DisciplinaryCase() {
        // JPA için
    }

    private DisciplinaryCase(
            Long caseId, Long employeeId, String reason, String defense, DisciplinaryCaseStatus status) {
        this.caseId = caseId;
        this.employeeId = employeeId;
        this.reason = reason;
        this.defense = defense;
        this.status = status;
    }

    /** Sürecin İLK (kök) revizyonu — {@code caseId} NULL, kendi id'si kök olur. */
    public static DisciplinaryCase open(Long employeeId, String reason) {
        return new DisciplinaryCase(null, employeeId, reason, null, DisciplinaryCaseStatus.OPEN);
    }

    /**
     * {@code previous}'un durumunu (çalışan, gerekçe, durum) miras alan,
     * savunması eklenmiş YENİ bir revizyon üretir. {@code previous} nesnesi
     * DEĞİŞTİRİLMEZ.
     */
    public static DisciplinaryCase reviseWithDefense(DisciplinaryCase previous, String defense) {
        return new DisciplinaryCase(
                previous.rootCaseId(), previous.employeeId, previous.reason, defense, previous.status);
    }

    /** {@code previous}'un durumunu miras alan, {@code CLOSED} olarak işaretlenmiş YENİ bir revizyon üretir. */
    public static DisciplinaryCase reviseAsClosed(DisciplinaryCase previous) {
        return new DisciplinaryCase(
                previous.rootCaseId(),
                previous.employeeId,
                previous.reason,
                previous.defense,
                DisciplinaryCaseStatus.CLOSED);
    }

    /** Bu satırın ait olduğu sürecin KÖK (ilk) revizyonunun id'si — dışarıya hep bu id gösterilir. */
    public Long rootCaseId() {
        return caseId != null ? caseId : getId();
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public String getReason() {
        return reason;
    }

    public String getDefense() {
        return defense;
    }

    public DisciplinaryCaseStatus getStatus() {
        return status;
    }

    public Long getCaseId() {
        return caseId;
    }
}
