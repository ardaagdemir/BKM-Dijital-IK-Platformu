package com.digitalik.recruitment.exception;

import com.digitalik.recruitment.controller.CandidateController;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * US-05.2.2: {@link CandidateNotFoundException} → {@link ProblemDetail}
 * eşlemesi — {@code recruitment} modülünün İLK "bulunamadı" senaryosu
 * (US-05.1.1'in upsert deseni hiçbir 404 üretmiyordu, bu yüzden o story'de
 * bu sınıf henüz yoktu). US-05.3.1: {@link StaffingNormNotFoundException}
 * eşlemesi de eklendi.
 *
 * <p>{@code basePackageClasses}, {@code CandidateController} ile AYNI
 * PAKETTEKİ ({@code com.digitalik.recruitment.controller}) tüm controller'lara
 * uygulanır (bkz. {@code organization.OrganizationExceptionHandler}'daki
 * aynı gerekçe).
 *
 * <p><b>{@code @Order} zorunludur:</b> US-02.1.3'te canlıda yaşanan hatadan
 * çıkarılan ders — her yeni modül bunu tekrarlamalı, aksi halde platform
 * geneli {@code GlobalExceptionHandler}'ın genel {@code Exception.class}
 * yakalayıcısının gerisine düşüp 500 döner.
 */
@RestControllerAdvice(basePackageClasses = CandidateController.class)
@Order(Ordered.HIGHEST_PRECEDENCE)
class RecruitmentExceptionHandler {

    @ExceptionHandler(CandidateNotFoundException.class)
    ProblemDetail handleCandidateNotFound(CandidateNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Aday bulunamadı");
        return problem;
    }

    /** US-05.3.1 kabul kriteri: "Talep formu norm kadro kontrolü yapar; norm yoksa engellenir." */
    @ExceptionHandler(StaffingNormNotFoundException.class)
    ProblemDetail handleStaffingNormNotFound(StaffingNormNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Norm kadro bulunamadı");
        return problem;
    }

    @ExceptionHandler(HiringRequestNotFoundException.class)
    ProblemDetail handleHiringRequestNotFound(HiringRequestNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("İşe alım talebi bulunamadı");
        return problem;
    }

    /**
     * US-05.3.2: {@code leave.LeaveExceptionHandler}'daki (US-04.2.2) aynı
     * ders — {@code @PreAuthorize} reddi bu modülün kendi advice'ı
     * tarafından yakalanmazsa 500'e düşer.
     */
    @ExceptionHandler(AuthorizationDeniedException.class)
    ProblemDetail handleAuthorizationDenied(AuthorizationDeniedException ex) {
        ProblemDetail problem =
                ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Bu işlemi yapmaya yetkiniz yok.");
        problem.setTitle("Erişim reddedildi");
        return problem;
    }
}
