package com.digitalik.performance.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * US-06.1.2: Puanlama skalası (ör. 1-5) — {@link Goal}/{@link Competency}'nin
 * AKSİNE bir referans LİSTESİ değil, sistem genelinde TEK bir yapılandırma
 * kaydı (bkz. {@code RatingScaleService}'teki upsert deseni: kayıt yoksa
 * oluşturulur, varsa güncellenir — {@code organization.EmployeeProfileService}'teki
 * aynı desen, ama burada doğal bir anahtar yerine "her zaman tek satır"
 * kuralı var).
 *
 * <p>Kabul kriteri ("Skala değerlendirme formunda kullanılır") İLERİYE
 * DÖNÜK bir gerekçe — değerlendirme formu (Feature 06.2) henüz kurulmadı;
 * bu story yalnızca skalanın TANIMLANMASINI kapsıyor.
 */
@Entity
@Table(name = "rating_scales")
public class RatingScale extends BaseEntity {

    @Column(nullable = false)
    private Integer minValue;

    @Column(nullable = false)
    private Integer maxValue;

    protected RatingScale() {
        // JPA için
    }

    public RatingScale(Integer minValue, Integer maxValue) {
        this.minValue = minValue;
        this.maxValue = maxValue;
    }

    public void update(Integer minValue, Integer maxValue) {
        this.minValue = minValue;
        this.maxValue = maxValue;
    }

    public Integer getMinValue() {
        return minValue;
    }

    public Integer getMaxValue() {
        return maxValue;
    }
}
