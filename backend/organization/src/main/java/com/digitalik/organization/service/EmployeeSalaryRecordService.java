package com.digitalik.organization.service;

import com.digitalik.organization.entity.EmployeeSalaryRecord;
import com.digitalik.organization.exception.EmployeeNotFoundException;
import com.digitalik.organization.repository.EmployeeRepository;
import com.digitalik.organization.repository.EmployeeSalaryRecordRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-03.3.3: Çalışanın ücret/terfi geçmişine yeni bir kayıt eklenmesi ve bu
 * geçmişin listelenmesi. Kasıtlı olarak GÜNCELLEME/SİLME metodu yok — kabul
 * kriteri ("yeni kayıt eskisini silmez") salt-ekleme bir geçmiş istiyor.
 */
@Service
public class EmployeeSalaryRecordService {

    private final EmployeeSalaryRecordRepository employeeSalaryRecordRepository;
    private final EmployeeRepository employeeRepository;

    public EmployeeSalaryRecordService(
            EmployeeSalaryRecordRepository employeeSalaryRecordRepository, EmployeeRepository employeeRepository) {
        this.employeeSalaryRecordRepository = employeeSalaryRecordRepository;
        this.employeeRepository = employeeRepository;
    }

    public EmployeeSalaryRecord create(Long employeeId, BigDecimal amount, LocalDate effectiveDate, String reason) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new EmployeeNotFoundException();
        }
        if (amount == null || amount.signum() <= 0) {
            throw new IllegalArgumentException("Ücret sıfırdan büyük olmalıdır.");
        }
        if (effectiveDate == null) {
            throw new IllegalArgumentException("Yürürlük tarihi boş olamaz.");
        }

        return employeeSalaryRecordRepository.save(new EmployeeSalaryRecord(employeeId, amount, effectiveDate, reason));
    }

    public List<EmployeeSalaryRecord> listByEmployee(Long employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new EmployeeNotFoundException();
        }

        return employeeSalaryRecordRepository.findByEmployeeIdOrderByEffectiveDateDesc(employeeId);
    }
}
