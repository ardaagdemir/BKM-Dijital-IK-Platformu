package com.digitalik.auth.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.digitalik.auth.entity.Role;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-02.2.1 kabul kriteri: "Roller uygulama başlarken (seed data) hazır gelir."
 *
 * <p>Bu test yalnızca {@code Role} varlığının kod bazında benzersiz saklanıp
 * okunabildiğini doğrular. V6 migration'ındaki asıl seed satırları (ADMIN/IK/
 * YONETICI/CALISAN) test ortamında değil — Flyway test'lerde kapalı olduğu için
 * (bkz. src/test/resources/application.yml) — canlı (Docker) doğrulamada
 * kontrol edilir; bkz. docs/04-implementation-log.md.
 */
@SpringBootTest
@Transactional
class RoleRepositoryTest {

    @Autowired
    private RoleRepository roleRepository;

    @Test
    void rolKaydedilipKoduIleBulunabilir() {
        roleRepository.save(new Role(Role.ADMIN));

        assertThat(roleRepository.findByCode(Role.ADMIN)).isPresent();
        assertThat(roleRepository.findByCode("OLMAYAN_ROL")).isEmpty();
    }
}
