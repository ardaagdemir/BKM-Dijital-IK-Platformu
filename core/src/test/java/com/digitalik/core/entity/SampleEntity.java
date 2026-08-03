package com.digitalik.core.entity;

import jakarta.persistence.Entity;

/**
 * {@link BaseEntity} auditing davranışını test etmek için kullanılan, yalnızca
 * teste özgü bir varlık. İlk gerçek üretim varlığı US-03.2.1 (Çalışan kaydı) ile
 * oluşturulacaktır.
 */
@Entity
public class SampleEntity extends BaseEntity {

    private String name;

    protected SampleEntity() {
        // JPA için
    }

    public SampleEntity(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
