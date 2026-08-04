package com.digitalik.payroll;

import com.digitalik.platform.file.VirusScanService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * {@code payroll} modülünü, gerçek uygulamayı ({@code bootstrap} modülü) derlemeye
 * gerek kalmadan tek başına test edebilmek için kullanılan, yalnızca teste özgü bir
 * başlangıç sınıfı. Ayrıntılı gerekçe için bkz. {@code auth.AuthTestApplication}.
 *
 * <p>US-08D.1.2: {@code leave}/{@code attendance}/{@code travel} de tarama
 * kapsamına eklendi — {@code payroll} artık bu modüllere GERÇEK bir Maven
 * bağımlılığıyla bağlı (bkz. {@code payroll/pom.xml}'deki not); izole test
 * bağlamının da bu modüllerin repository/servis bean'lerini bulabilmesi
 * gerekiyor.
 *
 * <p>US-09.7.1: {@code com.digitalik.platform} da eklendi — {@code
 * travel.ExpenseItemService} artık {@code platform.file.FileStorageService}'e
 * bağımlı (transitive Maven bağımlılığı zaten var, ama izole test bağlamının
 * bean'i bulabilmesi için tarama kapsamı da genişlemeli).
 *
 * <p>US-09.8.1: {@code com.digitalik.organization} da eklendi — {@code
 * BankPaymentFileService} artık {@code organization.EmployeeRepository}/{@code
 * EmployeeSalaryRecordRepository}'e bağımlı (AYNI gerekçe).
 */
@SpringBootApplication(
        scanBasePackages = {
            "com.digitalik.payroll",
            "com.digitalik.core",
            "com.digitalik.leave",
            "com.digitalik.attendance",
            "com.digitalik.travel",
            "com.digitalik.platform",
            "com.digitalik.organization"
        })
@EntityScan(
        basePackages = {
            "com.digitalik.payroll",
            "com.digitalik.core",
            "com.digitalik.leave",
            "com.digitalik.attendance",
            "com.digitalik.travel",
            "com.digitalik.platform",
            "com.digitalik.organization"
        })
@EnableJpaRepositories(
        basePackages = {
            "com.digitalik.payroll",
            "com.digitalik.core",
            "com.digitalik.leave",
            "com.digitalik.attendance",
            "com.digitalik.travel",
            "com.digitalik.platform",
            "com.digitalik.organization"
        })
class PayrollTestApplication {

    public static void main(String[] args) {
        SpringApplication.run(PayrollTestApplication.class, args);
    }

    /** US-09.7.2: bkz. {@code platform.PlatformTestApplication}'daki AYNI gerekçe. */
    @Bean
    @Primary
    VirusScanService testVirusScanService() {
        return data -> false;
    }
}
