package com.digitalik.platform.customfield;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomFieldValueRepository extends JpaRepository<CustomFieldValue, Long> {

    List<CustomFieldValue> findByEntityIdAndDefinitionIdIn(Long entityId, List<Long> definitionIds);

    Optional<CustomFieldValue> findByDefinitionIdAndEntityId(Long definitionId, Long entityId);
}
