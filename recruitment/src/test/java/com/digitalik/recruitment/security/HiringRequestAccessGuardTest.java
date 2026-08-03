package com.digitalik.recruitment.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.digitalik.recruitment.entity.HiringRequest;
import com.digitalik.recruitment.repository.HiringRequestRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-05.3.2 kabul kriteri: iki aşamalı onay zincirinin "yönetici" adımı,
 * yalnızca kendi biriminin talepleri için geçerli olmalı. Gerçek
 * {@code @PreAuthorize} uygulaması bu modülün izole test ortamında görünmüyor
 * (bkz. {@code LeaveRequestAccessGuardTest}'teki aynı gerekçe) — bu test
 * yalnızca {@link HiringRequestAccessGuard#isOwnUnit}'in kendi mantığını
 * doğrudan doğrular.
 */
@SpringBootTest
@Transactional
class HiringRequestAccessGuardTest {

    @Autowired
    private HiringRequestAccessGuard hiringRequestAccessGuard;

    @Autowired
    private HiringRequestRepository hiringRequestRepository;

    @Test
    void kendiBirimListesindekiTalepIcinTrueDoner() {
        HiringRequest request = hiringRequestRepository.save(new HiringRequest(7L, 1L));

        assertThat(hiringRequestAccessGuard.isOwnUnit(request.getId(), List.of(3L, 7L, 9L))).isTrue();
    }

    @Test
    void baskaBirimeAitTalepIcinFalseDoner() {
        HiringRequest request = hiringRequestRepository.save(new HiringRequest(7L, 1L));

        assertThat(hiringRequestAccessGuard.isOwnUnit(request.getId(), List.of(3L, 9L))).isFalse();
    }

    @Test
    void bosVeyaNullListeIcinFalseDoner() {
        HiringRequest request = hiringRequestRepository.save(new HiringRequest(7L, 1L));

        assertThat(hiringRequestAccessGuard.isOwnUnit(request.getId(), List.of())).isFalse();
        assertThat(hiringRequestAccessGuard.isOwnUnit(request.getId(), null)).isFalse();
    }

    @Test
    void olmayanTalepIcinFalseDoner() {
        assertThat(hiringRequestAccessGuard.isOwnUnit(999999L, List.of(7L))).isFalse();
    }
}
