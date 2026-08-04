package com.digitalik.platform.customfield;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomFieldDefinitionRepository extends JpaRepository<CustomFieldDefinition, Long> {

    List<CustomFieldDefinition> findByEntityType(String entityType);

    Optional<CustomFieldDefinition> findByEntityTypeAndFieldName(String entityType, String fieldName);
}
