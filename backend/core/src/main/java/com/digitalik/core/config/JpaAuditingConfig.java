package com.digitalik.core.config;

import com.digitalik.core.entity.BaseEntity;
import java.util.Optional;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * US-01.2.1: {@link BaseEntity} alanlarını doldurmak için JPA auditing'i etkinleştirir.
 *
 * <p>Bölüm 2 (Kullanıcı Girişi ve Yetkilendirme) henüz tamamlanmadığı için oturum açmış
 * kullanıcı bağlamı yoktur; {@code auditorProvider} bu aşamada sabit bir "system" değeri
 * döner. US-02.1.1 tamamlandığında burası güvenlik bağlamındaki gerçek kullanıcıya
 * bağlanacaktır.
 */
@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
public class JpaAuditingConfig {

    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> Optional.of("system");
    }
}
