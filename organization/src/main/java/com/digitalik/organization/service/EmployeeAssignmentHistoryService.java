package com.digitalik.organization.service;

import com.digitalik.organization.entity.EmployeeAssignmentHistory;
import com.digitalik.organization.exception.EmployeeNotFoundException;
import com.digitalik.organization.repository.EmployeeAssignmentHistoryRepository;
import com.digitalik.organization.repository.EmployeeRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-03.4.1: Bir çalışanın unvan/birim değişikliği geçmişinin (en yeni önce)
 * listelenmesi. Kayıtların OLUŞTURULMASI/kapatılması burada değil,
 * {@link EmployeeService#assign}'de yapılıyor (atama değişikliğiyle aynı
 * işlemin bir parçası) — bu servis yalnızca OKUMA içindir.
 */
@Service
public class EmployeeAssignmentHistoryService {

    private final EmployeeAssignmentHistoryRepository employeeAssignmentHistoryRepository;
    private final EmployeeRepository employeeRepository;

    public EmployeeAssignmentHistoryService(
            EmployeeAssignmentHistoryRepository employeeAssignmentHistoryRepository,
            EmployeeRepository employeeRepository) {
        this.employeeAssignmentHistoryRepository = employeeAssignmentHistoryRepository;
        this.employeeRepository = employeeRepository;
    }

    public List<EmployeeAssignmentHistory> listByEmployee(Long employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new EmployeeNotFoundException();
        }

        return employeeAssignmentHistoryRepository.findByEmployeeIdOrderByStartDateDescIdDesc(employeeId);
    }
}
