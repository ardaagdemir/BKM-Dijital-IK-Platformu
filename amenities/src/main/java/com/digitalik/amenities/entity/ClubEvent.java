package com.digitalik.amenities.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDate;

/**
 * US-08G.1.2: Bir kulübün etkinliği. Kabul kriteri: "Etkinlik yalnızca
 * lider tarafından oluşturulabilir" — bu kural {@link
 * com.digitalik.amenities.service.ClubEventService#create} içinde, isteği
 * yapan çalışanın id'si {@link Club#getLeaderId()} ile karşılaştırılarak
 * uygulanıyor (bkz. o sınıfın javadoc'u). FR-905'in "içerik paylaşma /
 * katılım listesi takibi" zenginliği BİLİNÇLİ OLARAK taşınmadı — roadmap
 * bu story için yalnızca "etkinlik oluşturmak" istiyor.
 *
 * <p>{@code clubId}, AYNI modül içindeki {@link Club}'a normal bir FK ile
 * bağlıdır.
 */
@Entity
@Table(name = "club_events")
public class ClubEvent extends BaseEntity {

    @Column(nullable = false)
    private Long clubId;

    @Column(nullable = false)
    private String name;

    @Column(name = "event_date", nullable = false)
    private LocalDate date;

    protected ClubEvent() {
        // JPA için
    }

    public ClubEvent(Long clubId, String name, LocalDate date) {
        this.clubId = clubId;
        this.name = name;
        this.date = date;
    }

    public Long getClubId() {
        return clubId;
    }

    public String getName() {
        return name;
    }

    public LocalDate getDate() {
        return date;
    }
}
