package com.digitalik.organization.dto;

import java.time.LocalDate;

public record EmployeeProfileResponse(
        Long employeeId,
        LocalDate birthDate,
        String birthPlace,
        String gender,
        String city,
        String district,
        String addressLine,
        String educationLevel,
        String schoolName,
        Integer graduationYear,
        String foreignLanguage,
        String languageLevel) {
}
