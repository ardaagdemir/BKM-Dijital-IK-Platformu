package com.digitalik.organization.controller;

import com.digitalik.organization.service.EmployeeCustomFieldService;
import com.digitalik.platform.customfield.dto.CustomFieldValueResponse;
import java.util.List;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-09.5.1'in {@code organization} tarafı — {@code platform.customfield}'ın
 * jenerik değer okuma/yazma servisini {@code Employee} için REST ucu haline
 * getirir. Hangi alanların TANIMLI olduğu (admin CRUD) {@code
 * platform.customfield.CustomFieldDefinitionController}'ın sorumluluğunda;
 * burada yalnızca belirli bir çalışanın DEĞERLERİ yönetiliyor.
 *
 * <p>{@code GET}, {@code EmployeeController.getProfile}'daki AYNI {@code
 * EmployeeAccessGuard} ile korunuyor (kişisel veri); {@code PUT} ise diğer
 * İK-yazma uçlarıyla TUTARLI olarak rol kısıtlaması OLMADAN bırakıldı (bkz.
 * {@code EmployeeController}'daki AYNI gerekçe).
 */
@RestController
@RequestMapping("/api/organization/employees/{id}/custom-fields")
public class EmployeeCustomFieldController {

    private final EmployeeCustomFieldService employeeCustomFieldService;

    public EmployeeCustomFieldController(EmployeeCustomFieldService employeeCustomFieldService) {
        this.employeeCustomFieldService = employeeCustomFieldService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'IK') or @employeeAccessGuard.isSelf(#id, authentication)")
    public List<CustomFieldValueResponse> getValues(@PathVariable Long id) {
        return employeeCustomFieldService.getValues(id);
    }

    @PutMapping
    public List<CustomFieldValueResponse> setValues(@PathVariable Long id, @RequestBody Map<String, String> fieldValues) {
        return employeeCustomFieldService.setValues(id, fieldValues);
    }
}
