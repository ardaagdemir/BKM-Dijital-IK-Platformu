package com.digitalik.leave.service;

import com.digitalik.leave.entity.LeaveType;
import com.digitalik.leave.exception.DuplicateLeaveTypeCodeException;
import com.digitalik.leave.exception.LeaveTypeNotFoundException;
import com.digitalik.leave.repository.LeaveTypeRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-04.1.1: İzin türleri referans listesi için CRUD (bkz.
 * {@code organization.JobTitleService} — aynı desen, buradaki tek fark
 * {@code code} alanının benzersizliğinin de doğrulanması).
 */
@Service
public class LeaveTypeService {

    private final LeaveTypeRepository leaveTypeRepository;

    public LeaveTypeService(LeaveTypeRepository leaveTypeRepository) {
        this.leaveTypeRepository = leaveTypeRepository;
    }

    public LeaveType create(String name, String code) {
        assertValid(name, code);
        if (leaveTypeRepository.existsByCode(code)) {
            throw new DuplicateLeaveTypeCodeException();
        }
        return leaveTypeRepository.save(new LeaveType(name, code));
    }

    public List<LeaveType> getAll() {
        return leaveTypeRepository.findAll();
    }

    public LeaveType update(Long id, String name, String code) {
        LeaveType leaveType = leaveTypeRepository.findById(id).orElseThrow(LeaveTypeNotFoundException::new);

        assertValid(name, code);
        if (leaveTypeRepository.existsByCodeAndIdNot(code, id)) {
            throw new DuplicateLeaveTypeCodeException();
        }

        leaveType.update(name, code);
        return leaveTypeRepository.save(leaveType);
    }

    public void delete(Long id) {
        if (!leaveTypeRepository.existsById(id)) {
            throw new LeaveTypeNotFoundException();
        }
        leaveTypeRepository.deleteById(id);
    }

    private void assertValid(String name, String code) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("İzin türü adı boş olamaz.");
        }
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("İzin türü kodu boş olamaz.");
        }
    }
}
