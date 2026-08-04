package com.digitalik.organization;

import com.digitalik.platform.file.VirusScanService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * {@code organization} modülünü, gerçek uygulamayı ({@code bootstrap} modülü) derlemeye
 * gerek kalmadan tek başına test edebilmek için kullanılan, yalnızca teste özgü bir
 * başlangıç sınıfı. Ayrıntılı gerekçe için bkz. {@code auth.AuthTestApplication}.
 */
@SpringBootApplication(scanBasePackages = {"com.digitalik.organization", "com.digitalik.core", "com.digitalik.platform"})
@EntityScan(basePackages = {"com.digitalik.organization", "com.digitalik.core", "com.digitalik.platform"})
@EnableJpaRepositories(basePackages = {"com.digitalik.organization", "com.digitalik.core", "com.digitalik.platform"})
class   OrganizationTestApplication {

    public static void main(String[] args) {
        SpringApplication.run(OrganizationTestApplication.class, args);
    }

    /** US-09.7.2: bkz. {@code platform.PlatformTestApplication}'daki AYNI gerekçe. */
    @Bean
    @Primary
    VirusScanService testVirusScanService() {
        return data -> false;
    }
}
