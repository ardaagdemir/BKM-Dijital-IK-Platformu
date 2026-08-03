package com.digitalik.leave.controller;

import com.digitalik.leave.dto.LeaveTypeRequest;
import com.digitalik.leave.dto.LeaveTypeResponse;
import com.digitalik.leave.entity.LeaveType;
import com.digitalik.leave.service.LeaveTypeService;
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
 * US-04.1.1: İzin türleri (yıllık, mazeret vb.) CRUD ekranı — projedeki
 * {@code leave} modülünün İLK ucu.
 *
 * <p>Rol kısıtlaması eklenmedi — {@code organization.JobTitleController}'daki
 * aynı gerekçe: kabul kriteri bundan bahsetmiyor, roadmap'teki bağımlılığı da
 * (US-03.1.1) bir rol/yetki story'si değil; yalnızca platform geneli "kimlik
 * doğrulaması gerekir" kuralı geçerli.
 */
@RestController
@RequestMapping("/api/leave/types")
public class LeaveTypeController {

    private final LeaveTypeService leaveTypeService;

    public LeaveTypeController(LeaveTypeService leaveTypeService) {
        this.leaveTypeService = leaveTypeService;
    }

    @PostMapping
    public ResponseEntity<LeaveTypeResponse> create(@RequestBody LeaveTypeRequest request) {
        LeaveType leaveType = leaveTypeService.create(request.name(), request.code());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(leaveType));
    }

    @GetMapping
    public List<LeaveTypeResponse> getAll() {
        return leaveTypeService.getAll().stream().map(LeaveTypeController::toResponse).toList();
    }

    @PutMapping("/{id}")
    public LeaveTypeResponse update(@PathVariable Long id, @RequestBody LeaveTypeRequest request) {
        return toResponse(leaveTypeService.update(id, request.name(), request.code()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        leaveTypeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private static LeaveTypeResponse toResponse(LeaveType leaveType) {
        return new LeaveTypeResponse(leaveType.getId(), leaveType.getName(), leaveType.getCode());
    }
}
