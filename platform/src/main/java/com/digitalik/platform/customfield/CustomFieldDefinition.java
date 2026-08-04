package com.digitalik.platform.customfield;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

/**
 * US-09.5.1: "Sistem yöneticisi olarak, kod değişikliği olmadan yeni bir
 * alan tanımlamak istiyorum." {@code entityType} (ör. "Employee") +
 * {@code fieldName} üzerinden, herhangi bir modülün varlığına ait — o
 * varlığın kendi şemasında YOK — parametrik bir alan tanımı. {@code
 * selectOptions}, yalnızca {@link CustomFieldType#SELECT} için kullanılan,
 * virgülle ayrılmış seçenek listesidir.
 */
@Entity
@Table(name = "custom_field_definitions")
public class CustomFieldDefinition extends BaseEntity {

    @Column(nullable = false)
    private String entityType;

    @Column(nullable = false)
    private String fieldName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CustomFieldType fieldType;

    private String selectOptions;

    @Column(nullable = false)
    private boolean required;

    protected CustomFieldDefinition() {
        // JPA için
    }

    public CustomFieldDefinition(
            String entityType, String fieldName, CustomFieldType fieldType, String selectOptions, boolean required) {
        this.entityType = entityType;
        this.fieldName = fieldName;
        this.fieldType = fieldType;
        this.selectOptions = selectOptions;
        this.required = required;
    }

    public String getEntityType() {
        return entityType;
    }

    public String getFieldName() {
        return fieldName;
    }

    public CustomFieldType getFieldType() {
        return fieldType;
    }

    public String getSelectOptions() {
        return selectOptions;
    }

    public boolean isRequired() {
        return required;
    }
}
