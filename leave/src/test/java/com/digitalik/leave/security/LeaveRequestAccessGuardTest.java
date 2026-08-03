package com.digitalik.leave.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.digitalik.leave.entity.LeaveRequest;
import com.digitalik.leave.repository.LeaveRequestRepository;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-04.2.2 kabul kriteri: "Yönetici yalnızca kendi ekibinin taleplerini
 * görür/onaylar." Gerçek {@code @PreAuthorize} uygulaması bu modülün izole
 * test ortamında görünmüyor (bkz. {@code EmployeeAccessGuardTest}'teki aynı
 * gerekçe) — bu test yalnızca {@link LeaveRequestAccessGuard#isTeamMember}'ın
 * kendi mantığını doğrudan doğrular.
 */
@SpringBootTest
@Transactional
class LeaveRequestAccessGuardTest {

    @Autowired
    private LeaveRequestAccessGuard leaveRequestAccessGuard;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Test
    void ekipListesindekiCalisaninTalebiIcinTrueDoner() {
        LeaveRequest request = leaveRequestRepository.save(
                new LeaveRequest(42L, 1L, LocalDate.of(2026, 8, 1), LocalDate.of(2026, 8, 5)));

        assertThat(leaveRequestAccessGuard.isTeamMember(request.getId(), List.of(10L, 42L, 99L))).isTrue();
    }

    @Test
    void ekipListesindeOlmayanCalisaninTalebiIcinFalseDoner() {
        LeaveRequest request = leaveRequestRepository.save(
                new LeaveRequest(42L, 1L, LocalDate.of(2026, 8, 1), LocalDate.of(2026, 8, 5)));

        assertThat(leaveRequestAccessGuard.isTeamMember(request.getId(), List.of(10L, 99L))).isFalse();
    }

    @Test
    void bosVeyaNullListeIcinFalseDoner() {
        LeaveRequest request = leaveRequestRepository.save(
                new LeaveRequest(42L, 1L, LocalDate.of(2026, 8, 1), LocalDate.of(2026, 8, 5)));

        assertThat(leaveRequestAccessGuard.isTeamMember(request.getId(), List.of())).isFalse();
        assertThat(leaveRequestAccessGuard.isTeamMember(request.getId(), null)).isFalse();
    }

    @Test
    void olmayanTalepIcinFalseDoner() {
        assertThat(leaveRequestAccessGuard.isTeamMember(999999L, List.of(42L))).isFalse();
    }
}
