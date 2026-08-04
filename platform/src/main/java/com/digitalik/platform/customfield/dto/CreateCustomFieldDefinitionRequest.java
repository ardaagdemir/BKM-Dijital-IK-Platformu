package com.digitalik.platform.customfield.dto;

import com.digitalik.platform.customfield.CustomFieldType;

/** {@code selectOptions}: yalnızca {@link CustomFieldType#SELECT} için, virgülle ayrılmış seçenek listesi. */
public record CreateCustomFieldDefinitionRequest(
        String entityType, String fieldName, CustomFieldType fieldType, String selectOptions, boolean required) {
}
