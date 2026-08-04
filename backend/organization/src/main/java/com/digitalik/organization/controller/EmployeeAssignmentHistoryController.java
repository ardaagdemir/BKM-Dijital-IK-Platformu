package com.digitalik.organization.controller;

import com.digitalik.organization.dto.EmployeeAssignmentHistoryResponse;
import com.digitalik.organization.entity.EmployeeAssignmentHistory;
import com.digitalik.organization.service.EmployeeAssignmentHistoryService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-03.4.1: Bir çalışanın unvan/birim değişikliği geçmişi (en yeni önce).
 * Kayıtlar {@code EmployeeController.assign} ({@code PUT .../assignment})
 * çağrıldığında otomatik oluşturulur — burada yalnızca GÖRÜNTÜLEME var.
 *
 * <p>Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor; bu
 * modüldeki çoğu okuma/yazma ucuyla aynı emsal (yalnızca platform geneli
 * "kimlik doğrulaması gerekir" kuralı geçerli).
 */
@RestController
@RequestMapping("/api/organization/employees/{employeeId}/assignment-history")
public class EmployeeAssignmentHistoryController {

    private final EmployeeAssignmentHistoryService employeeAssignmentHistoryService;

    public EmployeeAssignmentHistoryController(EmployeeAssignmentHistoryService employeeAssignmentHistoryService) {
        this.employeeAssignmentHistoryService = employeeAssignmentHistoryService;
    }

    @GetMapping
    public List<EmployeeAssignmentHistoryResponse> list(@PathVariable Long employeeId) {
        return employeeAssignmentHistoryService.listByEmployee(employeeId).stream()
                .map(EmployeeAssignmentHistoryController::toResponse)
                .toList();
    }

    private static EmployeeAssignmentHistoryResponse toResponse(EmployeeAssignmentHistory history) {
        return new EmployeeAssignmentHistoryResponse(
                history.getId(),
                history.getEmployeeId(),
                history.getOrganizationUnitId(),
                history.getJobTitleId(),
                history.getStartDate(),
                history.getEndDate());
    }
}
