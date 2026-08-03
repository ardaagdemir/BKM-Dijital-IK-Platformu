package com.digitalik.recruitment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * {@code recruitment} modülünü, gerçek uygulamayı ({@code bootstrap} modülü) derlemeye
 * gerek kalmadan tek başına test edebilmek için kullanılan, yalnızca teste özgü bir
 * başlangıç sınıfı. Ayrıntılı gerekçe için bkz. {@code auth.AuthTestApplication}.
 */
@SpringBootApplication(scanBasePackages = {"com.digitalik.recruitment", "com.digitalik.core"})
@EntityScan(basePackages = {"com.digitalik.recruitment", "com.digitalik.core"})
@EnableJpaRepositories(basePackages = {"com.digitalik.recruitment", "com.digitalik.core"})
class RecruitmentTestApplication {

    public static void main(String[] args) {
        SpringApplication.run(RecruitmentTestApplication.class, args);
    }
}
