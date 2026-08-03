package com.digitalik.core.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * {@code GlobalExceptionHandler}'ın gerçek bir HTTP isteği üzerinden davranışını
 * doğrulamak için kullanılan, yalnızca teste özgü bir controller. İlk gerçek
 * production controller'ı Bölüm 2 (Kullanıcı Girişi) ile gelecektir.
 */
@RestController
public class ThrowingTestController {

    @GetMapping("/test/gecersiz-istek")
    String throwIllegalArgument() {
        throw new IllegalArgumentException("Zorunlu alan eksik.");
    }

    @GetMapping("/test/beklenmeyen-hata")
    String throwUnexpected() {
        throw new RuntimeException("Beklenmedik durum.");
    }
}
