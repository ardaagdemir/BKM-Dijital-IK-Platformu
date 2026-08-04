package com.digitalik.platform;

import com.digitalik.platform.file.VirusScanService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * {@code platform} modülünü, gerçek uygulamayı ({@code bootstrap} modülü) derlemeye
 * gerek kalmadan tek başına test edebilmek için kullanılan, yalnızca teste özgü bir
 * başlangıç sınıfı. Ayrıntılı gerekçe için bkz. {@code auth.AuthTestApplication}.
 */
@SpringBootApplication(scanBasePackages = {"com.digitalik.platform", "com.digitalik.core"})
@EntityScan(basePackages = {"com.digitalik.platform", "com.digitalik.core"})
@EnableJpaRepositories(basePackages = {"com.digitalik.platform", "com.digitalik.core"})
class PlatformTestApplication {

    public static void main(String[] args) {
        SpringApplication.run(PlatformTestApplication.class, args);
    }

    /**
     * US-09.7.2: Test ortamında gerçek bir ClamAV çalışmıyor — component-scan
     * ile bulunan {@code ClamAvVirusScanService}'in ÜZERİNE ({@code @Primary})
     * geçen, hiçbir dosyayı enfekte saymayan bir sahte (stub) bean. Bu, {@code
     * platform}'a bağımlı OLAN HER modülün ({@code travel}, {@code payroll},
     * vb.) kendi test bağlamında AYNI şekilde tekrarlanan bir desendir.
     */
    @Bean
    @Primary
    VirusScanService testVirusScanService() {
        return data -> false;
    }
}
