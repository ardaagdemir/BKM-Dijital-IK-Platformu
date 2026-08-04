package com.digitalik.auth.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * US-02.2.1: Sistemin hazır (seed data) rolleri. Kod sabitleri, US-02.2.2'de
 * (kullanıcıya rol atama) ve sonrasında rol koduna magic string yerine bu
 * sınıf üzerinden referans verilebilmesi içindir.
 */
@Entity
@Table(name = "roles")
public class Role extends BaseEntity {

    public static final String ADMIN = "ADMIN";
    public static final String IK = "IK";
    public static final String YONETICI = "YONETICI";
    public static final String CALISAN = "CALISAN";

    @Column(nullable = false, unique = true)
    private String code;

    protected Role() {
        // JPA için
    }

    public Role(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
