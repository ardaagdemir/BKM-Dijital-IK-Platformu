package com.digitalik.core;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * {@code core} modülünü, gerçek uygulamayı ({@code bootstrap} modülü) derlemeye gerek
 * kalmadan tek başına (bkz. {@link BaseEntityAuditingTest} vb.) test edebilmek için
 * kullanılan, yalnızca teste özgü bir başlangıç sınıfı.
 */
@SpringBootApplication
class CoreTestApplication {

    public static void main(String[] args) {
        SpringApplication.run(CoreTestApplication.class, args);
    }
}
