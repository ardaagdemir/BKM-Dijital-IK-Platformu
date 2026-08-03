package com.digitalik.organization.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * US-08I.1.2: Bir unvana bağlı görev tanımı. Kabul kriteri: "Görev tanımı
 * unvana bağlanır." FR-1004'ün "görev-yetki-sorumluluk ayrıştırma,
 * raporlama ilişkisi, yetkinlik/pozisyon gerekliliği" zenginliği ve
 * FR-1005'in versiyonlama/bildirim zenginliği BİLİNÇLİ OLARAK taşınmadı —
 * kabul kriteri yalnızca "unvana bağlanan" bir görev tanımı istiyor;
 * {@code content} tek bir serbest metin alanı.
 *
 * <p>{@code jobTitleId}, {@code organization.JobTitle}'a diğer tüm
 * modüllerdeki AYNI modüller-arası güven sınırı gerekçesiyle FK'siz düz
 * bir {@code Long} olarak tutulur.
 */
@Entity
@Table(name = "job_descriptions")
public class JobDescription extends BaseEntity {

    @Column(nullable = false)
    private Long jobTitleId;

    @Column(nullable = false)
    private String content;

    protected JobDescription() {
        // JPA için
    }

    public JobDescription(Long jobTitleId, String content) {
        this.jobTitleId = jobTitleId;
        this.content = content;
    }

    public Long getJobTitleId() {
        return jobTitleId;
    }

    public String getContent() {
        return content;
    }
}
