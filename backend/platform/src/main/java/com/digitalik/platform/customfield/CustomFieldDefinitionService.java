package com.digitalik.platform.customfield;

import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-09.5.1 kabul kriteri: "Sistem yöneticisi olarak, kod değişikliği
 * olmadan yeni bir alan tanımlamak istiyorum." Hiçbir modülde henüz bir
 * admin ekranı yok — bu, projenin Bölüm 1-8 boyunca izlediği "önce backend
 * API, ekran sonra" deseniyle yalnızca bir REST API olarak karşılanıyor
 * (bkz. {@code CustomFieldDefinitionController}, {@code
 * ApprovalChainDefinitionService}'teki AYNI desen).
 */
@Service
public class CustomFieldDefinitionService {

    private final CustomFieldDefinitionRepository customFieldDefinitionRepository;

    public CustomFieldDefinitionService(CustomFieldDefinitionRepository customFieldDefinitionRepository) {
        this.customFieldDefinitionRepository = customFieldDefinitionRepository;
    }

    public CustomFieldDefinition create(
            String entityType, String fieldName, CustomFieldType fieldType, String selectOptions, boolean required) {
        if (entityType == null || entityType.isBlank()) {
            throw new IllegalArgumentException("Varlık tipi boş olamaz.");
        }
        if (fieldName == null || fieldName.isBlank()) {
            throw new IllegalArgumentException("Alan adı boş olamaz.");
        }
        if (fieldType == null) {
            throw new IllegalArgumentException("Alan tipi boş olamaz.");
        }
        if (fieldType == CustomFieldType.SELECT && (selectOptions == null || selectOptions.isBlank())) {
            throw new IllegalArgumentException("Seçim tipi için en az bir seçenek gereklidir.");
        }
        if (customFieldDefinitionRepository.findByEntityTypeAndFieldName(entityType, fieldName).isPresent()) {
            throw new IllegalArgumentException("Bu varlık tipi için bu adla bir alan zaten tanımlı.");
        }

        return customFieldDefinitionRepository.save(
                new CustomFieldDefinition(entityType, fieldName, fieldType, selectOptions, required));
    }

    public List<CustomFieldDefinition> getByEntityType(String entityType) {
        return customFieldDefinitionRepository.findByEntityType(entityType);
    }
}
