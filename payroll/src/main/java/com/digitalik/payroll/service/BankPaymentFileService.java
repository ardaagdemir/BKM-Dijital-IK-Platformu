package com.digitalik.payroll.service;

import com.digitalik.core.export.CsvExporter;
import com.digitalik.organization.entity.Employee;
import com.digitalik.organization.entity.EmployeeSalaryRecord;
import com.digitalik.organization.repository.EmployeeRepository;
import com.digitalik.organization.repository.EmployeeSalaryRecordRepository;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;
import org.springframework.stereotype.Service;

/**
 * US-09.8.1 kabul kriteri: "Sistem, onaylanmış bordro verisinden banka
 * ödeme dosyası üretir." Gerçek bir banka XML standardı (ISO 20022 vb.)
 * YOK — projenin {@code PayrollExportService}'teki AYNI "basit CSV"
 * hassasiyetiyle tutarlı, {@code calisan_id,iban,tutar,aciklama} sütunlu
 * bir dosya üretiliyor.
 *
 * <p>{@code payroll}'un {@code organization}'a YENİ tek-yönlü bağımlılığı
 * — {@code leave}/{@code attendance}/{@code travel}'a olan mevcut
 * istisnanın (bkz. {@code payroll/pom.xml}) AYNI deseni.
 *
 * <p>Her çalışan için, dönemin SON gününe kadar yürürlüğe girmiş EN SON
 * {@link EmployeeSalaryRecord} kullanılır (o dönemde geçerli olan ücret).
 * IBAN'ı OLMAYAN veya o döneme kadar hiç ücret kaydı OLMAYAN çalışanlar
 * dosyaya dahil edilmez (ödenecek bir hesap/tutar yok).
 */
@Service
public class BankPaymentFileService {

    private static final String[] HEADER = {"calisan_id", "iban", "tutar", "aciklama"};

    private final EmployeeRepository employeeRepository;
    private final EmployeeSalaryRecordRepository employeeSalaryRecordRepository;

    public BankPaymentFileService(
            EmployeeRepository employeeRepository, EmployeeSalaryRecordRepository employeeSalaryRecordRepository) {
        this.employeeRepository = employeeRepository;
        this.employeeSalaryRecordRepository = employeeSalaryRecordRepository;
    }

    public String generateCsv(int year, int month) {
        LocalDate periodEnd = YearMonth.of(year, month).atEndOfMonth();
        String aciklama = "%d-%02d bordro ödemesi".formatted(year, month);

        List<String[]> rows = new ArrayList<>();
        for (Employee employee : employeeRepository.findAll()) {
            if (employee.getIban() == null || employee.getIban().isBlank()) {
                continue;
            }

            Optional<EmployeeSalaryRecord> currentSalary = employeeSalaryRecordRepository
                    .findByEmployeeIdOrderByEffectiveDateDesc(employee.getId())
                    .stream()
                    .filter(record -> !record.getEffectiveDate().isAfter(periodEnd))
                    .findFirst();
            if (currentSalary.isEmpty()) {
                continue;
            }

            rows.add(new String[] {
                String.valueOf(employee.getId()), employee.getIban(), String.valueOf(currentSalary.get().getAmount()), aciklama
            });
        }

        return CsvExporter.export(HEADER, rows, Function.identity());
    }
}
