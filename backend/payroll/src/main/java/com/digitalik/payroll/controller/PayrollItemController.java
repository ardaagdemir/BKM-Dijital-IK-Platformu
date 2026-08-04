package com.digitalik.payroll.controller;

import com.digitalik.payroll.dto.PayrollItemRequest;
import com.digitalik.payroll.dto.PayrollItemResponse;
import com.digitalik.payroll.entity.PayrollItem;
import com.digitalik.payroll.service.PayrollItemService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-08D.1.1: Ücret kalemi tanımlama (+ CRUD, {@code
 * organization.JobTitleController}'daki AYNI desen). Rol kısıtlaması
 * eklenmedi — kabul kriteri bundan bahsetmiyor.
 */
@RestController
@RequestMapping("/api/payroll/items")
public class PayrollItemController {

    private final PayrollItemService payrollItemService;

    public PayrollItemController(PayrollItemService payrollItemService) {
        this.payrollItemService = payrollItemService;
    }

    @PostMapping
    public ResponseEntity<PayrollItemResponse> create(@RequestBody PayrollItemRequest request) {
        PayrollItem payrollItem = payrollItemService.create(request.name(), request.type());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(payrollItem));
    }

    @GetMapping
    public List<PayrollItemResponse> getAll() {
        return payrollItemService.getAll().stream().map(PayrollItemController::toResponse).toList();
    }

    @PutMapping("/{id}")
    public PayrollItemResponse update(@PathVariable Long id, @RequestBody PayrollItemRequest request) {
        return toResponse(payrollItemService.update(id, request.name(), request.type()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        payrollItemService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private static PayrollItemResponse toResponse(PayrollItem payrollItem) {
        return new PayrollItemResponse(payrollItem.getId(), payrollItem.getName(), payrollItem.getType());
    }
}
