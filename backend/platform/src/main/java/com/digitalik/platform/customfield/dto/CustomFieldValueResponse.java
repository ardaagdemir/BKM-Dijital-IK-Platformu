package com.digitalik.platform.customfield.dto;

import com.digitalik.platform.customfield.CustomFieldType;

/** {@code value}: bu varlık kaydı için değer hiç girilmemişse {@code null}. */
public record CustomFieldValueResponse(String fieldName, CustomFieldType fieldType, String value) {
}
