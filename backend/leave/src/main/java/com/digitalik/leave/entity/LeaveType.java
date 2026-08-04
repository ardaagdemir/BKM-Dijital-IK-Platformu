package com.digitalik.leave.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * US-04.1.1: İzin türü (yıllık, mazeret vb.) — henüz genel bir parametrik
 * çerçeve değil ({@code organization.JobTitle}'daki gibi), sabit alan
 * setiyle ({@code name}/{@code code}) basit bir referans listesi.
 *
 * <p>{@code code} (ör. {@code "YILLIK"}, {@code "MAZERET"}), gelecekteki
 * story'lerin (ör. US-04.1.2'nin hak ediş hesaplaması) türü PROGRAMATİK
 * olarak referans alabilmesi için eklendi — {@code JobTitle}'ın aksine
 * (yalnızca {@code name}) burada bir iş anlamı taşıyan, benzersiz bir
 * kod gerekiyor.
 */
@Entity
@Table(name = "leave_types")
public class LeaveType extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String code;

    protected LeaveType() {
        // JPA için
    }

    public LeaveType(String name, String code) {
        this.name = name;
        this.code = code;
    }

    public void update(String name, String code) {
        this.name = name;
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public String getCode() {
        return code;
    }
}
