package com.digitalik.amenities.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * US-08H.1.1: Randevu alınabilecek bir hizmet (işyeri hekimi, diyetisyen,
 * ...) — {@code organization.JobTitle}'daki AYNI minimal referans listesi
 * deseni. FR-1201'in zengin alanları (kategori, hizmet veren kişi, süre,
 * günlük maks randevu sayısı, lokasyon, açıklama, iptal süresi) BİLİNÇLİ
 * OLARAK taşınmadı — kabul kriteri yalnızca "hizmet ... tanımlamak" diyor.
 *
 * <p>Sınıf adı bilinçli olarak {@code Service} DEĞİL — Spring'in {@code
 * org.springframework.stereotype.Service} anotasyonuyla aynı isim
 * çakışması/karışıklığı yaratırdı (bu modülün kendi servis sınıfları da
 * {@code @Service} kullanıyor).
 */
@Entity
@Table(name = "service_offerings")
public class ServiceOffering extends BaseEntity {

    @Column(nullable = false)
    private String name;

    protected ServiceOffering() {
        // JPA için
    }

    public ServiceOffering(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void rename(String name) {
        this.name = name;
    }
}
