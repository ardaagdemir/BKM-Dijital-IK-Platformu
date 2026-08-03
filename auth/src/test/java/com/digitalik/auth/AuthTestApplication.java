package com.digitalik.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * {@code auth} modülünü, gerçek uygulamayı ({@code bootstrap} modülü) derlemeye gerek
 * kalmadan tek başına (bkz. {@code controller.AuthControllerTest}) test edebilmek için
 * kullanılan, yalnızca teste özgü bir başlangıç sınıfı.
 *
 * <p>{@code scanBasePackages} açıkça {@code com.digitalik.core}'u da içerir; çünkü bu
 * sınıf {@code com.digitalik.auth} paketinde olduğundan varsayılan tarama yalnızca
 * kendi alt paketlerini kapsar — {@code core}'daki {@code BaseEntity} auditing'i ve
 * audit_log mekanizmasının burada da çalışması için gereklidir.
 *
 * <p>{@code @EntityScan}/{@code @EnableJpaRepositories} ayrıca ve açıkça gereklidir:
 * {@code scanBasePackages}, {@code @Component}/{@code @Configuration} taramasını
 * genişletir ama JPA entity/repository taraması Spring Boot'ta ayrı bir mekanizmadır
 * ve bu override'ı otomatik takip etmez.
 */
@SpringBootApplication(scanBasePackages = {"com.digitalik.auth", "com.digitalik.core"})
@EntityScan(basePackages = {"com.digitalik.auth", "com.digitalik.core"})
@EnableJpaRepositories(basePackages = {"com.digitalik.auth", "com.digitalik.core"})
class AuthTestApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthTestApplication.class, args);
    }
}
