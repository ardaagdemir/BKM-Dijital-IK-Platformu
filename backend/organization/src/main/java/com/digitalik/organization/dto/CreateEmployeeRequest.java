package com.digitalik.organization.dto;

import java.time.LocalDate;

public record CreateEmployeeRequest(
        String firstName, String lastName, String nationalId, LocalDate hireDate, String email) {
}
