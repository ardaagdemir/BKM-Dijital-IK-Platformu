package com.digitalik.attendance.service;

import com.digitalik.attendance.entity.WorkModelAssignment;
import com.digitalik.attendance.exception.WorkModelAssignmentNotFoundException;
import com.digitalik.attendance.exception.WorkModelNotFoundException;
import com.digitalik.attendance.repository.WorkModelAssignmentRepository;
import com.digitalik.attendance.repository.WorkModelRepository;
import org.springframework.stereotype.Service;

/**
 * US-07.1.2: Çalışana çalışma modeli atama — {@code organization.EmployeeProfileService}'teki
 * AYNI upsert (yoksa oluştur, varsa güncelle) deseni.
 *
 * <p>{@code employeeId}'nin GERÇEKTEN var olan bir çalışana ait olup
 * olmadığı burada DOĞRULANMIYOR — {@code attendance}, {@code organization}'a
 * bağımlı olmadığından (modüller arası Java bağımlılığı yok kuralı)
 * {@code EmployeeRepository}'ye erişemiyor; bu, {@code leave}/{@code performance}
 * modüllerindeki {@code employeeId} alanlarıyla AYNI, bilinçli kabul edilen
 * güven sınırı.
 */
@Service
public class WorkModelAssignmentService {

    private final WorkModelAssignmentRepository workModelAssignmentRepository;
    private final WorkModelRepository workModelRepository;

    public WorkModelAssignmentService(
            WorkModelAssignmentRepository workModelAssignmentRepository, WorkModelRepository workModelRepository) {
        this.workModelAssignmentRepository = workModelAssignmentRepository;
        this.workModelRepository = workModelRepository;
    }

    public WorkModelAssignment assign(Long employeeId, Long workModelId) {
        if (employeeId == null) {
            throw new IllegalArgumentException("Çalışan boş olamaz.");
        }
        if (workModelId == null) {
            throw new IllegalArgumentException("Çalışma modeli boş olamaz.");
        }
        if (!workModelRepository.existsById(workModelId)) {
            throw new WorkModelNotFoundException();
        }

        WorkModelAssignment assignment = workModelAssignmentRepository
                .findByEmployeeId(employeeId)
                .orElseGet(() -> new WorkModelAssignment(employeeId, workModelId));
        assignment.update(workModelId);

        return workModelAssignmentRepository.save(assignment);
    }

    public WorkModelAssignment getByEmployeeId(Long employeeId) {
        return workModelAssignmentRepository
                .findByEmployeeId(employeeId)
                .orElseThrow(WorkModelAssignmentNotFoundException::new);
    }
}
