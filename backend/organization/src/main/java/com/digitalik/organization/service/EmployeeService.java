package com.digitalik.organization.service;

import com.digitalik.core.validation.IbanValidator;
import com.digitalik.organization.entity.Employee;
import com.digitalik.organization.entity.EmployeeAssignmentHistory;
import com.digitalik.organization.exception.DuplicateNationalIdException;
import com.digitalik.organization.exception.EmployeeNotFoundException;
import com.digitalik.organization.exception.JobTitleNotFoundException;
import com.digitalik.organization.exception.OrganizationUnitNotFoundException;
import com.digitalik.organization.repository.EmployeeAssignmentHistoryRepository;
import com.digitalik.organization.repository.EmployeeRepository;
import com.digitalik.organization.repository.EmployeeSpecifications;
import com.digitalik.organization.repository.JobTitleRepository;
import com.digitalik.organization.repository.OrganizationUnitRepository;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

/**
 * US-03.2.1: Çalışan temel kaydı oluşturma; zorunlu alan ve TC Kimlik No
 * format doğrulaması.
 *
 * <p>US-03.2.2/US-03.4.1: Çalışanı bir organizasyon birimi + unvana atama/
 * atamayı değiştirme — {@code EmployeeAssignmentHistory} ile senkron: her
 * {@link #assign} çağrısı önceki açık geçmiş kaydını kapatır, yenisini açar
 * (bkz. {@link #assign} içindeki not).
 *
 * <p>US-03.2.3: İsim/birim/unvana göre filtrelenebilen, sayfalanmış listeleme.
 *
 * <p>US-03.2.5: Çalışan detayını görüntüleme ve temel bilgilerini güncelleme.
 */
@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final OrganizationUnitRepository organizationUnitRepository;
    private final JobTitleRepository jobTitleRepository;
    private final EmployeeAssignmentHistoryRepository employeeAssignmentHistoryRepository;

    public EmployeeService(
            EmployeeRepository employeeRepository,
            OrganizationUnitRepository organizationUnitRepository,
            JobTitleRepository jobTitleRepository,
            EmployeeAssignmentHistoryRepository employeeAssignmentHistoryRepository) {
        this.employeeRepository = employeeRepository;
        this.organizationUnitRepository = organizationUnitRepository;
        this.jobTitleRepository = jobTitleRepository;
        this.employeeAssignmentHistoryRepository = employeeAssignmentHistoryRepository;
    }

    public Employee create(String firstName, String lastName, String nationalId, LocalDate hireDate, String email) {
        assertBasicFieldsValid(firstName, lastName, nationalId, hireDate, email);
        if (employeeRepository.existsByNationalId(nationalId)) {
            throw new DuplicateNationalIdException();
        }

        return employeeRepository.save(new Employee(firstName, lastName, nationalId, hireDate, email));
    }

    public Employee getById(Long id) {
        return employeeRepository.findById(id).orElseThrow(EmployeeNotFoundException::new);
    }

    /**
     * Bölüm 14.3'ün ön-koşulu: {@code leave} modülü (ve diğerleri) her uçta
     * çıplak bir {@code employeeId} bekliyor, ama frontend'in oturum
     * sahibinin KENDİ ID'sini bulacağı hiçbir uç yoktu — {@code User} ile
     * {@code Employee} arasında bir FK bağı da yok (bkz.
     * {@code EmployeeAccessGuard}'ın AYNI kısıtı). Bu, o boşluğu e-posta
     * eşleşmesiyle kapatır; kayıt yoksa (ör. çalışan olmayan bir ADMIN
     * hesabı) 404 NORMAL bir durumdur.
     */
    public Employee getByEmail(String email) {
        return employeeRepository.findByEmailIgnoreCase(email).orElseThrow(EmployeeNotFoundException::new);
    }

    public Employee update(
            Long id, String firstName, String lastName, String nationalId, LocalDate hireDate, String email) {
        Employee employee = employeeRepository.findById(id).orElseThrow(EmployeeNotFoundException::new);

        assertBasicFieldsValid(firstName, lastName, nationalId, hireDate, email);
        if (employeeRepository.existsByNationalIdAndIdNot(nationalId, id)) {
            throw new DuplicateNationalIdException();
        }

        employee.update(firstName, lastName, nationalId, hireDate, email);
        return employeeRepository.save(employee);
    }

    private void assertBasicFieldsValid(
            String firstName, String lastName, String nationalId, LocalDate hireDate, String email) {
        assertNotBlank(firstName, "Ad boş olamaz.");
        assertNotBlank(lastName, "Soyad boş olamaz.");
        assertNotBlank(email, "E-posta boş olamaz.");
        if (hireDate == null) {
            throw new IllegalArgumentException("İşe giriş tarihi boş olamaz.");
        }
        if (!isValidNationalId(nationalId)) {
            throw new IllegalArgumentException("TC Kimlik No geçersiz.");
        }
    }

    /**
     * US-03.4.1: Atama her değiştiğinde, önceki AÇIK geçmiş kaydı (varsa)
     * bugünün tarihiyle kapatılır ve yeni bir kayıt (bitiş tarihi olmadan)
     * açılır — {@code Employee.organizationUnitId}/{@code jobTitleId}
     * (GÜNCEL atama) değişmeden korunur, geçmiş buna EK olarak tutulur.
     */
    public Employee assign(Long employeeId, Long organizationUnitId, Long jobTitleId) {
        Employee employee = employeeRepository.findById(employeeId).orElseThrow(EmployeeNotFoundException::new);

        if (organizationUnitId == null) {
            throw new IllegalArgumentException("Organizasyon birimi boş olamaz.");
        }
        if (jobTitleId == null) {
            throw new IllegalArgumentException("Unvan boş olamaz.");
        }
        if (!organizationUnitRepository.existsById(organizationUnitId)) {
            throw new OrganizationUnitNotFoundException();
        }
        if (!jobTitleRepository.existsById(jobTitleId)) {
            throw new JobTitleNotFoundException();
        }

        LocalDate today = LocalDate.now();
        employeeAssignmentHistoryRepository
                .findByEmployeeIdAndEndDateIsNull(employeeId)
                .ifPresent(open -> {
                    open.close(today);
                    employeeAssignmentHistoryRepository.save(open);
                });
        employeeAssignmentHistoryRepository.save(
                new EmployeeAssignmentHistory(employeeId, organizationUnitId, jobTitleId, today));

        employee.assign(organizationUnitId, jobTitleId);
        return employeeRepository.save(employee);
    }

    /**
     * US-09.8.1: IBAN, temel bilgi güncellemesinden ({@link #update}) AYRI
     * bir uçla yönetiliyor — banka hesabı değişikliği ile ad/TC No/işe
     * giriş tarihi güncellemesi ayrı kaygılar.
     */
    public Employee updateIban(Long id, String iban) {
        Employee employee = employeeRepository.findById(id).orElseThrow(EmployeeNotFoundException::new);
        if (!IbanValidator.isValid(iban)) {
            throw new IllegalArgumentException("IBAN geçersiz.");
        }

        employee.updateIban(iban);
        return employeeRepository.save(employee);
    }

    public Page<Employee> search(String name, Long organizationUnitId, Long jobTitleId, Pageable pageable) {
        Specification<Employee> spec = Specification.where(EmployeeSpecifications.nameContains(name))
                .and(EmployeeSpecifications.hasOrganizationUnit(organizationUnitId))
                .and(EmployeeSpecifications.hasJobTitle(jobTitleId));
        return employeeRepository.findAll(spec, pageable);
    }

    private void assertNotBlank(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
    }

    /**
     * T.C. Kimlik No'nun resmi kontrol basamağı algoritması: 11 hane, ilk hane
     * sıfır olamaz, 10. hane (1,3,5,7,9. hanelerin toplamı×7 − 2,4,6,8.
     * hanelerin toplamı) mod 10'a, 11. hane ise ilk 10 hanenin toplamı mod
     * 10'a eşit olmalıdır.
     */
    private boolean isValidNationalId(String nationalId) {
        if (nationalId == null || !nationalId.matches("\\d{11}") || nationalId.charAt(0) == '0') {
            return false;
        }

        int[] digits = nationalId.chars().map(c -> c - '0').toArray();

        int oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
        int evenSum = digits[1] + digits[3] + digits[5] + digits[7];
        int expectedTenth = Math.floorMod(oddSum * 7 - evenSum, 10);
        if (expectedTenth != digits[9]) {
            return false;
        }

        int firstTenSum = 0;
        for (int i = 0; i < 10; i++) {
            firstTenSum += digits[i];
        }
        int expectedEleventh = firstTenSum % 10;
        return expectedEleventh == digits[10];
    }
}
