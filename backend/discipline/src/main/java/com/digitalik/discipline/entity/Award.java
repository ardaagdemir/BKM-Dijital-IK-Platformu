package com.digitalik.discipline.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * US-08C.1.4: Bir çalışana verilen ödül kaydı (takdir belgesi, prim vb.).
 * Kabul kriteri yalnızca "Kayıt çalışana bağlanır" diyor — FR-1308'in
 * "ödül türleri enum'u / veren kişi / ek doküman" zenginliği BİLİNÇLİ
 * OLARAK taşınmadı ({@link Warning}'daki (US-08C.1.1) AYNI roadmap'in
 * basitleştirilmiş kabul kriterini uygulama konvansiyonu).
 *
 * <p>{@code type} SERBEST METİN — story metnindeki "(takdir belgesi, prim
 * vb.)" ifadesi örnek değerlerdir, sabit bir tür kümesi İSTEMİYOR; bir enum
 * icat etmek yanlış bir varsayım olurdu ({@code training.Training.type}'daki
 * (US-08A.1.1) AYNI gerekçe).
 *
 * <p>{@code employeeId}, {@code organization.Employee}'ye DB seviyesinde bir
 * FK İLE değil düz bir {@code Long} olarak tutulur — diğer tüm modüllerdeki
 * AYNI modüller-arası güven sınırı gerekçesi.
 */
@Entity
@Table(name = "awards")
public class Award extends BaseEntity {

    @Column(nullable = false)
    private Long employeeId;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String description;

    protected Award() {
        // JPA için
    }

    public Award(Long employeeId, String type, String description) {
        this.employeeId = employeeId;
        this.type = type;
        this.description = description;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public String getType() {
        return type;
    }

    public String getDescription() {
        return description;
    }
}
