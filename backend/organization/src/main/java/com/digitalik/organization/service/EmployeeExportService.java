package com.digitalik.organization.service;

import com.digitalik.core.export.CsvExporter;
import com.digitalik.core.export.ExcelExporter;
import com.digitalik.organization.entity.Employee;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

/**
 * US-09.4.1: Çalışan listesini CSV/Excel olarak dışa aktarır — roadmap'in
 * kendi örneği ("Çalışan listesi, İzin geçmişi") için {@code core.export}
 * bileşeninin ilk tüketicisi.
 *
 * <p>{@code nationalId} (TC Kimlik No) BİLİNÇLİ OLARAK sütunlara
 * DAHİL EDİLMEDİ — toplu indirilebilir bir kanaldan hassas kimlik verisini
 * gereksiz yere yaymamak için (US-09.9.1'in şifreleyeceği alanlardan biri).
 */
@Service
public class EmployeeExportService {

    private static final String[] HEADER = {
        "id", "ad", "soyad", "eposta", "ise_baslama_tarihi", "organizasyon_birimi_id", "unvan_id"
    };

    private final EmployeeService employeeService;

    public EmployeeExportService(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    public String exportToCsv(String name, Long organizationUnitId, Long jobTitleId) {
        return CsvExporter.export(HEADER, fetchRows(name, organizationUnitId, jobTitleId), EmployeeExportService::toRow);
    }

    public byte[] exportToExcel(String name, Long organizationUnitId, Long jobTitleId) {
        return ExcelExporter.export(HEADER, fetchRows(name, organizationUnitId, jobTitleId), EmployeeExportService::toRow);
    }

    private List<Employee> fetchRows(String name, Long organizationUnitId, Long jobTitleId) {
        return employeeService.search(name, organizationUnitId, jobTitleId, Pageable.unpaged()).getContent();
    }

    private static String[] toRow(Employee employee) {
        return new String[] {
            String.valueOf(employee.getId()),
            employee.getFirstName(),
            employee.getLastName(),
            String.valueOf(employee.getEmail()),
            String.valueOf(employee.getHireDate()),
            String.valueOf(employee.getOrganizationUnitId()),
            String.valueOf(employee.getJobTitleId())
        };
    }
}
