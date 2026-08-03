package com.digitalik.organization.service;

import com.digitalik.organization.dto.OrganizationChartEmployeeResponse;
import com.digitalik.organization.dto.OrganizationChartNodeResponse;
import com.digitalik.organization.entity.Employee;
import com.digitalik.organization.entity.JobTitle;
import com.digitalik.organization.entity.OrganizationUnit;
import com.digitalik.organization.repository.EmployeeRepository;
import com.digitalik.organization.repository.JobTitleRepository;
import com.digitalik.organization.repository.OrganizationUnitRepository;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

/**
 * US-08I.1.3: Organizasyon şeması. Kabul kriteri: "Şema, Bölüm 3'teki
 * organizasyon/atama verisinden türetilir." — bu servis kendi verisini
 * ÜRETMEZ, yalnızca Bölüm 3'ün ({@link OrganizationUnit}/{@link
 * Employee}/{@link JobTitle}) mevcut verisini bir ağaca dönüştürür; bu
 * yüzden ayrı bir modül/migration YOK — {@code organization} modülünün
 * kendi içinde salt okunur bir kompozisyon.
 *
 * <p>FR-1008'in "boş pozisyon görüntüleme" ve FR-1009'un "dinamik/interaktif
 * şema" zenginliği BİLİNÇLİ OLARAK taşınmadı — kabul kriteri yalnızca
 * şemanın var olan veriden türetilmesini istiyor. {@code
 * organizationUnitId}/{@code jobTitleId} olmayan (atanmamış) çalışanlar
 * şemada HİÇ GÖRÜNMEZ — kabul kriteri bu boşluk senaryosundan bahsetmiyor.
 */
@Service
public class OrganizationChartService {

    private final OrganizationUnitRepository organizationUnitRepository;
    private final EmployeeRepository employeeRepository;
    private final JobTitleRepository jobTitleRepository;

    public OrganizationChartService(
            OrganizationUnitRepository organizationUnitRepository,
            EmployeeRepository employeeRepository,
            JobTitleRepository jobTitleRepository) {
        this.organizationUnitRepository = organizationUnitRepository;
        this.employeeRepository = employeeRepository;
        this.jobTitleRepository = jobTitleRepository;
    }

    public List<OrganizationChartNodeResponse> buildChart() {
        List<OrganizationUnit> units = organizationUnitRepository.findAll();
        Map<Long, String> jobTitleNamesById =
                jobTitleRepository.findAll().stream().collect(Collectors.toMap(JobTitle::getId, JobTitle::getName));

        Map<Long, List<Employee>> employeesByUnitId = employeeRepository.findAll().stream()
                .filter(employee -> employee.getOrganizationUnitId() != null)
                .collect(Collectors.groupingBy(Employee::getOrganizationUnitId));

        Map<Long, List<OrganizationUnit>> unitsByParentId = units.stream()
                .filter(unit -> unit.getParentId() != null)
                .collect(Collectors.groupingBy(OrganizationUnit::getParentId));

        List<OrganizationUnit> roots = units.stream().filter(unit -> unit.getParentId() == null).toList();

        return roots.stream()
                .map(root -> toNode(root, unitsByParentId, employeesByUnitId, jobTitleNamesById))
                .toList();
    }

    private OrganizationChartNodeResponse toNode(
            OrganizationUnit unit,
            Map<Long, List<OrganizationUnit>> unitsByParentId,
            Map<Long, List<Employee>> employeesByUnitId,
            Map<Long, String> jobTitleNamesById) {
        List<OrganizationChartEmployeeResponse> employees = employeesByUnitId
                .getOrDefault(unit.getId(), List.of())
                .stream()
                .map(employee -> new OrganizationChartEmployeeResponse(
                        employee.getId(),
                        employee.getFirstName(),
                        employee.getLastName(),
                        jobTitleNamesById.get(employee.getJobTitleId())))
                .toList();

        List<OrganizationChartNodeResponse> children = unitsByParentId
                .getOrDefault(unit.getId(), List.of())
                .stream()
                .sorted(Comparator.comparing(OrganizationUnit::getId))
                .map(child -> toNode(child, unitsByParentId, employeesByUnitId, jobTitleNamesById))
                .toList();

        return new OrganizationChartNodeResponse(unit.getId(), unit.getName(), employees, children);
    }
}
