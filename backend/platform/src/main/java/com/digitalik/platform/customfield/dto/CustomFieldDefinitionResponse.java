package com.digitalik.platform.customfield.dto;

import com.digitalik.platform.customfield.CustomFieldType;

public record CustomFieldDefinitionResponse(
        Long id, String entityType, String fieldName, CustomFieldType fieldType, String selectOptions, boolean required) {
}
