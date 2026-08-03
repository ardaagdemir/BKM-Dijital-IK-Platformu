package com.digitalik.payroll;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
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
 */
@SpringBootApplication(
        scanBasePackages = {
            "com.digitalik.payroll",
            "com.digitalik.core",
            "com.digitalik.leave",
            "com.digitalik.attendance",
            "com.digitalik.travel"
        })
@EntityScan(
        basePackages = {
            "com.digitalik.payroll",
            "com.digitalik.core",
            "com.digitalik.leave",
            "com.digitalik.attendance",
            "com.digitalik.travel"
        })
@EnableJpaRepositories(
        basePackages = {
            "com.digitalik.payroll",
            "com.digitalik.core",
            "com.digitalik.leave",
            "com.digitalik.attendance",
            "com.digitalik.travel"
        })
class PayrollTestApplication {

    public static void main(String[] args) {
        SpringApplication.run(PayrollTestApplication.class, args);
    }
}
