package com.digitalik.platform.customfield;

import com.digitalik.platform.customfield.dto.CreateCustomFieldDefinitionRequest;
import com.digitalik.platform.customfield.dto.CustomFieldDefinitionResponse;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-09.5.1 kabul kriteri: "Sistem yöneticisi olarak, kod değişikliği
 * olmadan yeni bir alan tanımlamak istiyorum. Alan tipi parametrik
 * tanımlanır ve ilgili formda görünür." Hiçbir modülde henüz bir admin
 * ekranı yok — "formda görünür" şartı, ilgili modülün {@code
 * GET .../custom-fields} ucunun (bkz. {@code
 * organization.EmployeeCustomFieldController}) döndürdüğü tanımların bir
 * form tarafından render edilebilecek her şeyi (alan adı/tipi/seçenekler/
 * zorunluluk) içermesiyle karşılanıyor.
 */
@RestController
@RequestMapping("/api/platform/custom-fields")
@PreAuthorize("hasRole('ADMIN')")
public class CustomFieldDefinitionController {

    private final CustomFieldDefinitionService customFieldDefinitionService;

    public CustomFieldDefinitionController(CustomFieldDefinitionService customFieldDefinitionService) {
        this.customFieldDefinitionService = customFieldDefinitionService;
    }

    @PostMapping
    public ResponseEntity<CustomFieldDefinitionResponse> create(@RequestBody CreateCustomFieldDefinitionRequest request) {
        CustomFieldDefinition definition = customFieldDefinitionService.create(
                request.entityType(), request.fieldName(), request.fieldType(), request.selectOptions(), request.required());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(definition));
    }

    @GetMapping
    public List<CustomFieldDefinitionResponse> getByEntityType(@RequestParam String entityType) {
        return customFieldDefinitionService.getByEntityType(entityType).stream().map(this::toResponse).toList();
    }

    private CustomFieldDefinitionResponse toResponse(CustomFieldDefinition definition) {
        return new CustomFieldDefinitionResponse(
                definition.getId(),
                definition.getEntityType(),
                definition.getFieldName(),
                definition.getFieldType(),
                definition.getSelectOptions(),
                definition.isRequired());
    }
}
