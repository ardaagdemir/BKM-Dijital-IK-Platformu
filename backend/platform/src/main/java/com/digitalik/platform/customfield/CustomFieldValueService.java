package com.digitalik.platform.customfield;

import com.digitalik.platform.customfield.dto.CustomFieldValueResponse;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

/**
 * US-09.5.1: Belirli bir varlık kaydının ({@code entityType} + {@code
 * entityId}) tüm özel alan değerlerini okur/yazar — hangi alanların
 * tanımlı olduğunu {@link CustomFieldDefinitionService} belirler, bu servis
 * yalnızca DEĞERLERİ yönetir.
 */
@Service
public class CustomFieldValueService {

    private final CustomFieldDefinitionRepository customFieldDefinitionRepository;
    private final CustomFieldValueRepository customFieldValueRepository;

    public CustomFieldValueService(
            CustomFieldDefinitionRepository customFieldDefinitionRepository,
            CustomFieldValueRepository customFieldValueRepository) {
        this.customFieldDefinitionRepository = customFieldDefinitionRepository;
        this.customFieldValueRepository = customFieldValueRepository;
    }

    public List<CustomFieldValueResponse> getValues(String entityType, Long entityId) {
        List<CustomFieldDefinition> definitions = customFieldDefinitionRepository.findByEntityType(entityType);
        List<Long> definitionIds = definitions.stream().map(CustomFieldDefinition::getId).toList();
        Map<Long, String> valuesByDefinitionId = customFieldValueRepository
                .findByEntityIdAndDefinitionIdIn(entityId, definitionIds)
                .stream()
                .collect(Collectors.toMap(CustomFieldValue::getDefinitionId, CustomFieldValue::getValue));

        return definitions.stream()
                .map(definition -> new CustomFieldValueResponse(
                        definition.getFieldName(), definition.getFieldType(), valuesByDefinitionId.get(definition.getId())))
                .toList();
    }

    /**
     * {@code fieldNameToValue}'daki her alanı, {@code entityType}'ın
     * tanımlı alanlarına göre doğrulayıp kaydeder (yoksa oluşturur, varsa
     * günceller — upsert). Zorunlu bir alan eksikse veya tip uyuşmazsa
     * (ör. NUMBER alanına sayı olmayan bir değer) reddedilir.
     */
    public List<CustomFieldValueResponse> setValues(String entityType, Long entityId, Map<String, String> fieldNameToValue) {
        List<CustomFieldDefinition> definitions = customFieldDefinitionRepository.findByEntityType(entityType);
        Set<String> knownFieldNames = new HashSet<>();
        for (CustomFieldDefinition definition : definitions) {
            knownFieldNames.add(definition.getFieldName());
        }
        for (String fieldName : fieldNameToValue.keySet()) {
            if (!knownFieldNames.contains(fieldName)) {
                throw new IllegalArgumentException("Bilinmeyen alan: " + fieldName);
            }
        }

        for (CustomFieldDefinition definition : definitions) {
            String rawValue = fieldNameToValue.get(definition.getFieldName());
            if (rawValue == null || rawValue.isBlank()) {
                if (definition.isRequired()) {
                    throw new IllegalArgumentException(definition.getFieldName() + " alanı zorunludur.");
                }
                continue;
            }
            validate(definition, rawValue);
            upsert(definition.getId(), entityId, rawValue);
        }

        return getValues(entityType, entityId);
    }

    private void validate(CustomFieldDefinition definition, String rawValue) {
        switch (definition.getFieldType()) {
            case NUMBER -> {
                try {
                    Double.parseDouble(rawValue);
                } catch (NumberFormatException e) {
                    throw new IllegalArgumentException(definition.getFieldName() + " sayısal bir değer olmalıdır.");
                }
            }
            case DATE -> {
                try {
                    LocalDate.parse(rawValue);
                } catch (DateTimeParseException e) {
                    throw new IllegalArgumentException(definition.getFieldName() + " geçerli bir tarih olmalıdır (YYYY-MM-DD).");
                }
            }
            case SELECT -> {
                List<String> options = List.of(definition.getSelectOptions().split(","));
                boolean valid = options.stream().anyMatch(option -> option.trim().equals(rawValue.trim()));
                if (!valid) {
                    throw new IllegalArgumentException(definition.getFieldName() + " geçerli bir seçenek değil.");
                }
            }
            case TEXT -> {
                // Serbest metin, ek doğrulama gerekmiyor.
            }
        }
    }

    private void upsert(Long definitionId, Long entityId, String value) {
        CustomFieldValue existing = customFieldValueRepository
                .findByDefinitionIdAndEntityId(definitionId, entityId)
                .orElse(null);
        if (existing != null) {
            existing.setValue(value);
            customFieldValueRepository.save(existing);
        } else {
            customFieldValueRepository.save(new CustomFieldValue(definitionId, entityId, value));
        }
    }
}
