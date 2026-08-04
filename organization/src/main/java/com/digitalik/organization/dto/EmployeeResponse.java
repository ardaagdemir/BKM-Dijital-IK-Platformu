package com.digitalik.organization.dto;

import java.time.LocalDate;

public record EmployeeResponse(
        Long id,
        String firstName,
        String lastName,
        String nationalId,
        LocalDate hireDate,
        String email,
        Long organizationUnitId,
        Long jobTitleId,
        String iban) {
}
