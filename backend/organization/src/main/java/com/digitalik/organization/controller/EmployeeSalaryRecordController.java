package com.digitalik.organization.controller;

import com.digitalik.organization.dto.CreateSalaryRecordRequest;
import com.digitalik.organization.dto.SalaryRecordResponse;
import com.digitalik.organization.entity.EmployeeSalaryRecord;
import com.digitalik.organization.service.EmployeeSalaryRecordService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-03.3.3: Çalışanın ücret/terfi geçmişi — {@code POST} yeni bir kayıt
 * ekler (eskisini SİLMEZ/DEĞİŞTİRMEZ), {@code GET} geçmişi (en yeni önce)
 * listeler. {@link EmployeeAssetController}'daki gibi ayrı bir controller —
 * gerçek çoklu-kayıt bir alt kaynak.
 *
 * <p>US-03.3.4: {@code GET} artık yalnızca ADMIN/IK rolüne açık — kabul
 * kriterindeki "Yetkisiz rol alanı göremez/maskeli görür" iki seçeneğinden
 * (engelle / maskele) İLKİ seçildi: kısmi alan maskeleme, bu modülde (ve
 * projenin geri kalanında) hiç kullanılmayan yeni bir kavram getirirdi; oysa
 * {@code @PreAuthorize} ile TAMAMEN engelleme, US-03.2.6'da zaten kurulmuş,
 * kanıtlanmış bir desen. Kabul kriteri BURADA — US-03.2.6/US-03.3.1'in aksine
 * — kaydın SAHİBİ için bir istisna TANIMLAMIYOR ("yalnızca yetkili roller",
 * self-view değil); bu yüzden {@code EmployeeAccessGuard} kullanılMADI, salt
 * {@code hasAnyRole('ADMIN','IK')} yeterli. {@code POST} (yeni kayıt ekleme)
 * kasıtlı olarak KISITLANMADI — kabul kriteri yalnızca GÖRÜNTÜLEMEDEN
 * bahsediyor, bu modüldeki diğer yazma uçlarıyla (ör. temel bilgi güncelleme)
 * aynı emsal korunuyor.
 */
@RestController
@RequestMapping("/api/organization/employees/{employeeId}/salary-records")
public class EmployeeSalaryRecordController {

    private final EmployeeSalaryRecordService employeeSalaryRecordService;

    public EmployeeSalaryRecordController(EmployeeSalaryRecordService employeeSalaryRecordService) {
        this.employeeSalaryRecordService = employeeSalaryRecordService;
    }

    @PostMapping
    public ResponseEntity<SalaryRecordResponse> create(
            @PathVariable Long employeeId, @RequestBody CreateSalaryRecordRequest request) {
        EmployeeSalaryRecord record = employeeSalaryRecordService.create(
                employeeId, request.amount(), request.effectiveDate(), request.reason());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(record));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'IK')")
    public List<SalaryRecordResponse> list(@PathVariable Long employeeId) {
        return employeeSalaryRecordService.listByEmployee(employeeId).stream()
                .map(EmployeeSalaryRecordController::toResponse)
                .toList();
    }

    private static SalaryRecordResponse toResponse(EmployeeSalaryRecord record) {
        return new SalaryRecordResponse(
                record.getId(), record.getEmployeeId(), record.getAmount(), record.getEffectiveDate(), record.getReason());
    }
}
