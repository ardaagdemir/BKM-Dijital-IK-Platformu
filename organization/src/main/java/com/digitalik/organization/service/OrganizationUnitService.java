package com.digitalik.organization.service;

import com.digitalik.organization.entity.OrganizationUnit;
import com.digitalik.organization.exception.OrganizationUnitNotFoundException;
import com.digitalik.organization.repository.OrganizationUnitRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-03.1.1: Organizasyon birimi oluşturma ve listeleme.
 *
 * <p>Yalnızca oluşturma sırasında bir üst birim (parentId) verildiğinde
 * mevcutluğu kontrol edilir; yeni oluşturulan bir birim henüz hiçbir birimin
 * ecdadı olamayacağından döngü (cycle) kontrolüne gerek yoktur.
 */
@Service
public class OrganizationUnitService {

    private final OrganizationUnitRepository organizationUnitRepository;

    public OrganizationUnitService(OrganizationUnitRepository organizationUnitRepository) {
        this.organizationUnitRepository = organizationUnitRepository;
    }

    public OrganizationUnit create(String name, Long parentId) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Birim adı boş olamaz.");
        }
        if (parentId != null && !organizationUnitRepository.existsById(parentId)) {
            throw new OrganizationUnitNotFoundException();
        }
        return organizationUnitRepository.save(new OrganizationUnit(name, parentId));
    }

    public List<OrganizationUnit> getAll() {
        return organizationUnitRepository.findAll();
    }
}
