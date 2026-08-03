package com.digitalik.attendance.controller;

import com.digitalik.attendance.dto.AssignWorkModelRequest;
import com.digitalik.attendance.dto.WorkModelAssignmentResponse;
import com.digitalik.attendance.entity.WorkModelAssignment;
import com.digitalik.attendance.service.WorkModelAssignmentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-07.1.2: Çalışana çalışma modeli atama — {@code organization.EmployeeController}'daki
 * {@code PUT/GET /{id}/profile} ile AYNI "atama, çalışan kaydına bağlanır"
 * yaklaşımı; ancak {@code Employee} kendisi {@code organization} modülünde
 * olduğundan burada AYRI bir controller (bkz. {@code WorkModelAssignmentService}
 * javadoc'undaki modüller-arası bağımlılık gerekçesi). Rol kısıtlaması
 * eklenmedi — kabul kriteri bundan bahsetmiyor.
 */
@RestController
@RequestMapping("/api/attendance/employees/{employeeId}/work-model-assignment")
public class WorkModelAssignmentController {

    private final WorkModelAssignmentService workModelAssignmentService;

    public WorkModelAssignmentController(WorkModelAssignmentService workModelAssignmentService) {
        this.workModelAssignmentService = workModelAssignmentService;
    }

    @PutMapping
    public WorkModelAssignmentResponse assign(
            @PathVariable Long employeeId, @RequestBody AssignWorkModelRequest request) {
        return toResponse(workModelAssignmentService.assign(employeeId, request.workModelId()));
    }

    @GetMapping
    public WorkModelAssignmentResponse get(@PathVariable Long employeeId) {
        return toResponse(workModelAssignmentService.getByEmployeeId(employeeId));
    }

    private static WorkModelAssignmentResponse toResponse(WorkModelAssignment assignment) {
        return new WorkModelAssignmentResponse(assignment.getEmployeeId(), assignment.getWorkModelId());
    }
}
