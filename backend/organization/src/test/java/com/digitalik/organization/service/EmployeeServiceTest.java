package com.digitalik.organization.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.digitalik.organization.entity.Employee;
import com.digitalik.organization.exception.EmployeeNotFoundException;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

/**
 * Bölüm 14.3'ün ön-koşulu: {@code getByEmail} — {@code GET /employees/me}'nin
 * arkasındaki mantık. Not: bu ucun `Authentication authentication`
 * parametresi, {@code organization} modülünün İZOLE test bağlamında
 * (spring-security-web/test YOK) ÇÖZÜLEMEDİĞİNDEN, HTTP katmanı Docker canlı
 * doğrulamasıyla kontrol edilir (bkz. {@code EmployeeAccessGuardTest}'teki
 * AYNI kısıt); burada yalnızca servis mantığı doğrudan test edilir.
 */
@SpringBootTest
@Transactional
class EmployeeServiceTest {

    @Autowired
    private EmployeeService employeeService;

    private static final String GECERLI_TC_NO = "10000000146";

    @Test
    void epostaEslesirseCalisanDoner() {
        employeeService.create("Ahmet", "Yılmaz", GECERLI_TC_NO, LocalDate.of(2026, 1, 15), "ahmet@dijitalik.local");

        Employee employee = employeeService.getByEmail("AHMET@dijitalik.local");

        assertThat(employee.getFirstName()).isEqualTo("Ahmet");
    }

    @Test
    void eslesenCalisanYoksa404AtarAnlaminaGelenIstisnaFirlatir() {
        assertThatThrownBy(() -> employeeService.getByEmail("olmayan@dijitalik.local"))
                .isInstanceOf(EmployeeNotFoundException.class);
    }
}
