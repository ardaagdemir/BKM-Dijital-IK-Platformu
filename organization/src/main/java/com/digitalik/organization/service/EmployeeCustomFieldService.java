package com.digitalik.organization.service;

import com.digitalik.organization.exception.EmployeeNotFoundException;
import com.digitalik.organization.repository.EmployeeRepository;
import com.digitalik.platform.customfield.CustomFieldValueService;
import com.digitalik.platform.customfield.dto.CustomFieldValueResponse;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

/**
 * US-09.5.1'in (dinamik/parametrik özel alan çerçevesi) {@code organization}
 * modülündeki İLK tüketicisi (roadmap'in kendi örneği, FR-406) — {@code
 * platform.customfield.CustomFieldValueService}'i {@code entityType="Employee"}
 * ile sarmalayan ince bir katman; asıl EAV-lite mantığı {@code platform}'da.
 */
@Service
public class EmployeeCustomFieldService {

    private static final String ENTITY_TYPE = "Employee";

    private final CustomFieldValueService customFieldValueService;
    private final EmployeeRepository employeeRepository;

    public EmployeeCustomFieldService(CustomFieldValueService customFieldValueService, EmployeeRepository employeeRepository) {
        this.customFieldValueService = customFieldValueService;
        this.employeeRepository = employeeRepository;
    }

    public List<CustomFieldValueResponse> getValues(Long employeeId) {
        requireExists(employeeId);
        return customFieldValueService.getValues(ENTITY_TYPE, employeeId);
    }

    public List<CustomFieldValueResponse> setValues(Long employeeId, Map<String, String> fieldNameToValue) {
        requireExists(employeeId);
        return customFieldValueService.setValues(ENTITY_TYPE, employeeId, fieldNameToValue);
    }

    private void requireExists(Long employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new EmployeeNotFoundException();
        }
    }
}
