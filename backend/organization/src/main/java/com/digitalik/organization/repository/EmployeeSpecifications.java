package com.digitalik.organization.repository;

import com.digitalik.organization.entity.Employee;
import org.springframework.data.jpa.domain.Specification;

/**
 * US-03.2.3: Çalışan listesi için isteğe bağlı filtreler. Her metot,
 * karşılık gelen parametre boş/null ise {@code null} döner —
 * {@code Specification.where(...).and(...)} zincirinde null bir filtre
 * "kısıtlama yok" anlamına gelir (Spring Data JPA'nın standart davranışı).
 */
public final class EmployeeSpecifications {

    private EmployeeSpecifications() {
    }

    public static Specification<Employee> nameContains(String name) {
        if (name == null || name.isBlank()) {
            return null;
        }
        String pattern = "%" + name.toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("firstName")), pattern), cb.like(cb.lower(root.get("lastName")), pattern));
    }

    public static Specification<Employee> hasOrganizationUnit(Long organizationUnitId) {
        if (organizationUnitId == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("organizationUnitId"), organizationUnitId);
    }

    public static Specification<Employee> hasJobTitle(Long jobTitleId) {
        if (jobTitleId == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("jobTitleId"), jobTitleId);
    }
}
