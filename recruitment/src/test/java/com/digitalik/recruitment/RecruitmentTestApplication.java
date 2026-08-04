package com.digitalik.recruitment;

import com.digitalik.platform.approval.ApprovalChainDefinitionService;
import com.digitalik.platform.file.VirusScanService;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * {@code recruitment} modülünü, gerçek uygulamayı ({@code bootstrap} modülü) derlemeye
 * gerek kalmadan tek başına test edebilmek için kullanılan, yalnızca teste özgü bir
 * başlangıç sınıfı. Ayrıntılı gerekçe için bkz. {@code auth.AuthTestApplication}.
 */
@SpringBootApplication(scanBasePackages = {"com.digitalik.recruitment", "com.digitalik.core", "com.digitalik.platform"})
@EntityScan(basePackages = {"com.digitalik.recruitment", "com.digitalik.core", "com.digitalik.platform"})
@EnableJpaRepositories(basePackages = {"com.digitalik.recruitment", "com.digitalik.core", "com.digitalik.platform"})
class RecruitmentTestApplication {

    public static void main(String[] args) {
        SpringApplication.run(RecruitmentTestApplication.class, args);
    }

    /** US-09.7.2: bkz. {@code platform.PlatformTestApplication}'daki AYNI gerekçe. */
    @Bean
    @Primary
    VirusScanService testVirusScanService() {
        return data -> false;
    }

    /**
     * US-09.2.1: Bu izole test bağlamı Flyway'i DEĞİL Hibernate'in şema
     * otomatik üretimini kullandığından, V65'in seed ettiği "hiring-request"
     * onay zinciri BURADA YOK — {@code HiringRequestService.create}'in
     * ihtiyaç duyduğu zinciri, gerçek migration'daki (V65) AYNI adım/rol
     * yapısıyla burada programatik olarak seed ediyoruz.
     */
    @Bean
    CommandLineRunner seedHiringRequestApprovalChain(ApprovalChainDefinitionService approvalChainDefinitionService) {
        return args -> approvalChainDefinitionService.create("hiring-request", List.of("YONETICI", "IK"));
    }
}
