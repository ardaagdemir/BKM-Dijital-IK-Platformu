package com.digitalik.platform.customfield;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * US-09.5.1: Bir {@link CustomFieldDefinition}'ın, belirli bir varlık
 * kaydı ({@code entityId}) için taşıdığı değer. Tip fark etmeksizin tek bir
 * String kolonunda tutulur (seyrek nullable kolonlar yerine) — okuma anında
 * {@link CustomFieldDefinition#getFieldType()}'a göre yorumlanır.
 */
@Entity
@Table(name = "custom_field_values")
public class CustomFieldValue extends BaseEntity {

    @Column(nullable = false)
    private Long definitionId;

    @Column(nullable = false)
    private Long entityId;

    /** {@code value}, H2/Postgres'te ayrılmış (reserved) bir kelime olduğundan kolon adı {@code field_value}. */
    @Column(name = "field_value")
    private String value;

    protected CustomFieldValue() {
        // JPA için
    }

    public CustomFieldValue(Long definitionId, Long entityId, String value) {
        this.definitionId = definitionId;
        this.entityId = entityId;
        this.value = value;
    }

    public Long getDefinitionId() {
        return definitionId;
    }

    public Long getEntityId() {
        return entityId;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
