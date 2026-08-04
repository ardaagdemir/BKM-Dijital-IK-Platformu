package com.digitalik.amenities.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * US-08G.1.1: Sosyal kulüp — {@code organization.JobTitle}'daki AYNI
 * minimal referans listesi deseni. FR-902'nin parametrik kulüp
 * kategorileri (spor, fotoğrafçılık, ...) BİLİNÇLİ OLARAK taşınmadı —
 * kabul kriteri yalnızca "kulüpleri görüntülemek" diyor, bir kategori
 * kavramından bahsetmiyor.
 *
 * <p>US-08G.1.2: {@code leaderId} (V53) — NULLABLE, çünkü bir kulübün
 * lideri henüz atanmamış olabilir. {@code ClubEventService.create},
 * yalnızca isteği yapan çalışanın id'si bu alanla eşleştiğinde etkinlik
 * oluşturulmasına izin verir (kabul kriteri: "Etkinlik yalnızca lider
 * tarafından oluşturulabilir"). {@code employeeId} gibi diğer alanlardan
 * FARKLI olarak DB seviyesinde bir FK İLE tutulmuyor — "lider" burada yalnızca
 * bir çalışan id'si, {@code organization.Employee}'ye modüller-arası güven
 * sınırı gerekçesiyle bağlanmıyor.
 */
@Entity
@Table(name = "clubs")
public class Club extends BaseEntity {

    @Column(nullable = false)
    private String name;

    private Long leaderId;

    protected Club() {
        // JPA için
    }

    public Club(String name, Long leaderId) {
        this.name = name;
        this.leaderId = leaderId;
    }

    public String getName() {
        return name;
    }

    public Long getLeaderId() {
        return leaderId;
    }

    public void rename(String name) {
        this.name = name;
    }

    public void assignLeader(Long leaderId) {
        this.leaderId = leaderId;
    }
}
