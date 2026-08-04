package com.digitalik.organization.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.digitalik.organization.entity.Employee;
import com.digitalik.organization.repository.EmployeeRepository;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-03.2.6 kabul kriteri: "Çalışan yalnızca kendi kaydını görür."
 *
 * <p>{@code @PreAuthorize}'ın gerçek uçtan uca uygulanması (401/403), bu
 * modülün kendi test ortamında {@code auth}'a (ve dolayısıyla
 * {@code @EnableMethodSecurity}'e) bağımlı olmadığından doğrulanamaz — bkz.
 * {@code OrganizationUnitControllerTest}'teki aynı gerekçe. Bu test yalnızca
 * {@link EmployeeAccessGuard#isSelf}'in kendi mantığını (e-posta eşleşmesi)
 * doğrudan doğrular; gerçek 403 davranışı Docker canlı doğrulamasıyla
 * kontrol edilir (bkz. docs/04-implementation-log.md).
 */
@SpringBootTest
@Transactional
class EmployeeAccessGuardTest {

    @Autowired
    private EmployeeAccessGuard employeeAccessGuard;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Test
    void kendiEPostasiylaEslesenKullaniciKendiKaydinaErisebilir() {
        Employee employee = employeeRepository.save(
                new Employee("Ahmet", "Yılmaz", "10000000146", LocalDate.of(2026, 1, 15), "ahmet@dijitalik.local"));

        var authentication = new UsernamePasswordAuthenticationToken("ahmet@dijitalik.local", null);

        assertThat(employeeAccessGuard.isSelf(employee.getId(), authentication)).isTrue();
    }

    @Test
    void farkliEPostaliKullaniciBaskaCalisaninKaydinaErisemez() {
        Employee employee = employeeRepository.save(
                new Employee("Ahmet", "Yılmaz", "10000000146", LocalDate.of(2026, 1, 15), "ahmet@dijitalik.local"));

        var authentication = new UsernamePasswordAuthenticationToken("baskasi@dijitalik.local", null);

        assertThat(employeeAccessGuard.isSelf(employee.getId(), authentication)).isFalse();
    }

    @Test
    void olmayanCalisanIcinFalseDoner() {
        var authentication = new UsernamePasswordAuthenticationToken("ahmet@dijitalik.local", null);

        assertThat(employeeAccessGuard.isSelf(999999L, authentication)).isFalse();
    }

    @Test
    void kimlikDogrulamaYoksaFalseDoner() {
        assertThat(employeeAccessGuard.isSelf(1L, null)).isFalse();
    }
}
