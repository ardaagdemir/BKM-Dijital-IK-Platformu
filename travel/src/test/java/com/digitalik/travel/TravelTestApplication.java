package com.digitalik.travel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * {@code travel} modülünü, gerçek uygulamayı ({@code bootstrap} modülü) derlemeye
 * gerek kalmadan tek başına test edebilmek için kullanılan, yalnızca teste özgü bir
 * başlangıç sınıfı. Ayrıntılı gerekçe için bkz. {@code auth.AuthTestApplication}.
 */
@SpringBootApplication(scanBasePackages = {"com.digitalik.travel", "com.digitalik.core", "com.digitalik.platform"})
@EntityScan(basePackages = {"com.digitalik.travel", "com.digitalik.core", "com.digitalik.platform"})
@EnableJpaRepositories(basePackages = {"com.digitalik.travel", "com.digitalik.core", "com.digitalik.platform"})
class TravelTestApplication {

    public static void main(String[] args) {
        SpringApplication.run(TravelTestApplication.class, args);
    }
}
