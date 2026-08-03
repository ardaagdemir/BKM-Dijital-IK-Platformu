package com.digitalik.organization.service;

import com.digitalik.organization.entity.EmployeeProfile;
import com.digitalik.organization.exception.EmployeeNotFoundException;
import com.digitalik.organization.exception.EmployeeProfileNotFoundException;
import com.digitalik.organization.repository.EmployeeProfileRepository;
import com.digitalik.organization.repository.EmployeeRepository;
import java.time.LocalDate;
import org.springframework.stereotype.Service;

/**
 * US-03.3.1: Genişletilmiş özlük bilgilerinin (kimlik/adres/öğrenim/yabancı
 * dil) görüntülenmesi ve upsert (yoksa oluştur, varsa güncelle) semantiğiyle
 * kaydedilmesi — kabul kriterindeki "eklenir ve güncellenebilir" tek bir
 * idempotent uçla ({@code PUT}) karşılanıyor, ayrı create/update uçlarına
 * gerek yok (bkz. {@link EmployeeService#assign}'daki aynı desen).
 */
@Service
public class EmployeeProfileService {

    private final EmployeeProfileRepository employeeProfileRepository;
    private final EmployeeRepository employeeRepository;

    public EmployeeProfileService(
            EmployeeProfileRepository employeeProfileRepository, EmployeeRepository employeeRepository) {
        this.employeeProfileRepository = employeeProfileRepository;
        this.employeeRepository = employeeRepository;
    }

    public EmployeeProfile getByEmployeeId(Long employeeId) {
        return employeeProfileRepository.findByEmployeeId(employeeId).orElseThrow(EmployeeProfileNotFoundException::new);
    }

    public EmployeeProfile save(
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
        if (!employeeRepository.existsById(employeeId)) {
            throw new EmployeeNotFoundException();
        }

        EmployeeProfile profile = employeeProfileRepository
                .findByEmployeeId(employeeId)
                .orElseGet(() -> new EmployeeProfile(employeeId));

        profile.update(
                birthDate,
                birthPlace,
                gender,
                city,
                district,
                addressLine,
                educationLevel,
                schoolName,
                graduationYear,
                foreignLanguage,
                languageLevel);

        return employeeProfileRepository.save(profile);
    }
}
