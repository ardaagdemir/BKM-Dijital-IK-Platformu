package com.digitalik.organization.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * US-03.1.1: Şirket/İşyeri/Bölüm hiyerarşisindeki bir birim.
 *
 * <p>{@code parentId}, {@code Session.userId} gibi projedeki diğer ilişkilerle
 * aynı gerekçeyle (bkz. o sınıftaki not) JPA {@code @ManyToOne} yerine düz bir
 * yabancı anahtar olarak tutulur. Şirket/İşyeri/Bölüm arasında zorunlu bir tip
 * ayrımı ŞİMDİLİK kurulmadı — kabul kriteri yalnızca "bir birim başka bir
 * birimin altına eklenebilir" (genel ağaç yapısı) gerektiriyor; tip bazlı
 * kısıtlamalar (ör. "Bölüm yalnızca İşyeri altına eklenebilir") ihtiyaç
 * netleşmeden eklenmedi (YAGNI).
 */
@Entity
@Table(name = "organization_units")
public class OrganizationUnit extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column
    private Long parentId;

    protected OrganizationUnit() {
        // JPA için
    }

    public OrganizationUnit(String name, Long parentId) {
        this.name = name;
        this.parentId = parentId;
    }

    public String getName() {
        return name;
    }

    public Long getParentId() {
        return parentId;
    }
}
