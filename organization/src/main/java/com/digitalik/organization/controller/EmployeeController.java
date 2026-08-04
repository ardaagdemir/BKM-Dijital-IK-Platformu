package com.digitalik.organization.controller;

import com.digitalik.organization.dto.AssignEmployeeRequest;
import com.digitalik.organization.dto.CreateEmployeeRequest;
import com.digitalik.organization.dto.EmployeeProfileRequest;
import com.digitalik.organization.dto.EmployeeProfileResponse;
import com.digitalik.organization.dto.EmployeeResponse;
import com.digitalik.organization.dto.UpdateIbanRequest;
import com.digitalik.organization.entity.Employee;
import com.digitalik.organization.entity.EmployeeProfile;
import com.digitalik.organization.service.EmployeeExportService;
import com.digitalik.organization.service.EmployeeProfileService;
import com.digitalik.organization.service.EmployeeService;
import java.nio.charset.StandardCharsets;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-03.2.1: Yeni bir çalışan için temel bilgilerle kayıt oluşturma.
 * US-03.2.2: Çalışanı bir organizasyon birimi + unvana atama (ve atamayı
 * sonradan değiştirme).
 * US-03.2.3: İsim/birim/unvana göre filtrelenebilen, sayfalanmış listeleme.
 * US-03.2.5: Çalışan detayını görüntüleme ve temel bilgilerini güncelleme.
 * US-03.2.6: Çalışan detayı ({@code GET /{id}}) yalnızca ADMIN/IK rolüne ya da
 * kaydın sahibine ({@link com.digitalik.organization.security.EmployeeAccessGuard})
 * açıktır — alan/kayıt bazlı yetkinin ilk somut örneği. Listeleme
 * ({@code GET /}) bu story'nin kapsamı dışında bırakıldı (yalnızca detay
 * görüntüleme story'nin kabul kriteridir); ihtiyaç netleşirse ayrı ele alınır.
 * US-03.3.1: Genişletilmiş özlük bilgileri (kimlik/adres/öğrenim/yabancı dil)
 * — {@code PUT/GET /{id}/profile}. {@code GET}, US-03.2.6'daki AYNI
 * {@code EmployeeAccessGuard} ile korunuyor (kişisel veri — doğum tarihi/adres
 * — {@code GET /{id}}'deki temel bilgilerden daha az hassas değil); {@code PUT}
 * ise diğer İK-yazma uçlarıyla (ör. {@code PUT /{id}}) TUTARLI olarak rol
 * kısıtlaması OLMADAN bırakıldı — bu story bunu istemiyor, mevcut
 * "temel bilgi güncelleme" ucuyla aynı emsal korunuyor.
 */
@RestController
@RequestMapping("/api/organization/employees")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final EmployeeProfileService employeeProfileService;
    private final EmployeeExportService employeeExportService;

    public EmployeeController(
            EmployeeService employeeService,
            EmployeeProfileService employeeProfileService,
            EmployeeExportService employeeExportService) {
        this.employeeService = employeeService;
        this.employeeProfileService = employeeProfileService;
        this.employeeExportService = employeeExportService;
    }

    @PostMapping
    public ResponseEntity<EmployeeResponse> create(@RequestBody CreateEmployeeRequest request) {
        Employee employee = employeeService.create(
                request.firstName(), request.lastName(), request.nationalId(), request.hireDate(), request.email());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(employee));
    }

    @PutMapping("/{id}/assignment")
    public EmployeeResponse assign(@PathVariable Long id, @RequestBody AssignEmployeeRequest request) {
        Employee employee = employeeService.assign(id, request.organizationUnitId(), request.jobTitleId());
        return toResponse(employee);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'IK') or @employeeAccessGuard.isSelf(#id, authentication)")
    public EmployeeResponse getById(@PathVariable Long id) {
        return toResponse(employeeService.getById(id));
    }

    @PutMapping("/{id}")
    public EmployeeResponse update(@PathVariable Long id, @RequestBody CreateEmployeeRequest request) {
        Employee employee = employeeService.update(
                id, request.firstName(), request.lastName(), request.nationalId(), request.hireDate(), request.email());
        return toResponse(employee);
    }

    /** US-09.8.1: {@code payroll.BankPaymentFileService}'in ihtiyaç duyduğu IBAN'ı yönetir. */
    @PutMapping("/{id}/iban")
    public EmployeeResponse updateIban(@PathVariable Long id, @RequestBody UpdateIbanRequest request) {
        return toResponse(employeeService.updateIban(id, request.iban()));
    }

    @GetMapping
    public Page<EmployeeResponse> search(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long organizationUnitId,
            @RequestParam(required = false) Long jobTitleId,
            @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return employeeService.search(name, organizationUnitId, jobTitleId, pageable).map(EmployeeController::toResponse);
    }

    /** US-09.4.1: {@code search}'teki AYNI filtrelerle, sayfalanmamış TÜM sonucu CSV/Excel olarak dışa aktarır. */
    @GetMapping("/export")
    public ResponseEntity<byte[]> export(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long organizationUnitId,
            @RequestParam(required = false) Long jobTitleId,
            @RequestParam(defaultValue = "csv") String format) {
        if ("xlsx".equalsIgnoreCase(format)) {
            byte[] xlsx = employeeExportService.exportToExcel(name, organizationUnitId, jobTitleId);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"calisanlar.xlsx\"")
                    .body(xlsx);
        }
        String csv = employeeExportService.exportToCsv(name, organizationUnitId, jobTitleId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv;charset=UTF-8"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"calisanlar.csv\"")
                .body(csv.getBytes(StandardCharsets.UTF_8));
    }

    @PutMapping("/{id}/profile")
    public EmployeeProfileResponse saveProfile(@PathVariable Long id, @RequestBody EmployeeProfileRequest request) {
        EmployeeProfile profile = employeeProfileService.save(
                id,
                request.birthDate(),
                request.birthPlace(),
                request.gender(),
                request.city(),
                request.district(),
                request.addressLine(),
                request.educationLevel(),
                request.schoolName(),
                request.graduationYear(),
                request.foreignLanguage(),
                request.languageLevel());
        return toProfileResponse(profile);
    }

    @GetMapping("/{id}/profile")
    @PreAuthorize("hasAnyRole('ADMIN', 'IK') or @employeeAccessGuard.isSelf(#id, authentication)")
    public EmployeeProfileResponse getProfile(@PathVariable Long id) {
        return toProfileResponse(employeeProfileService.getByEmployeeId(id));
    }

    private static EmployeeResponse toResponse(Employee employee) {
        return new EmployeeResponse(
                employee.getId(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getNationalId(),
                employee.getHireDate(),
                employee.getEmail(),
                employee.getOrganizationUnitId(),
                employee.getJobTitleId(),
                employee.getIban());
    }

    private static EmployeeProfileResponse toProfileResponse(EmployeeProfile profile) {
        return new EmployeeProfileResponse(
                profile.getEmployeeId(),
                profile.getBirthDate(),
                profile.getBirthPlace(),
                profile.getGender(),
                profile.getCity(),
                profile.getDistrict(),
                profile.getAddressLine(),
                profile.getEducationLevel(),
                profile.getSchoolName(),
                profile.getGraduationYear(),
                profile.getForeignLanguage(),
                profile.getLanguageLevel());
    }
}
