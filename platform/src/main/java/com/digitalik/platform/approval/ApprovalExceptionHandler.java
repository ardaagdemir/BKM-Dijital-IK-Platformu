package com.digitalik.platform.approval;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * US-09.2.2: {@code platform} modülünün İLK {@code @RestControllerAdvice}'ı
 * ({@code ApprovalChainDefinitionController} de İLK controller'ı) —
 * {@link ApprovalChainDefinitionNotFoundException} → {@link ProblemDetail}
 * eşlemesi.
 *
 * <p><b>{@code @Order} zorunludur:</b> US-02.1.3'te canlıda yaşanan
 * hatadan çıkarılan ders — her yeni modül bunu tekrarlamalı, aksi halde
 * platform geneli {@code GlobalExceptionHandler}'ın genel {@code
 * Exception.class} yakalayıcısının gerisine düşüp 500 döner.
 */
@RestControllerAdvice(basePackageClasses = ApprovalChainDefinitionController.class)
@Order(Ordered.HIGHEST_PRECEDENCE)
class ApprovalExceptionHandler {

    @ExceptionHandler(ApprovalChainDefinitionNotFoundException.class)
    ProblemDetail handleChainDefinitionNotFound(ApprovalChainDefinitionNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Onay zinciri tanımı bulunamadı");
        return problem;
    }

    /**
     * US-03.2.6/US-08H.1.3'teki AYNI ders — {@code @PreAuthorize} reddi
     * ({@link AuthorizationDeniedException}) bu modülün kendi advice'ı
     * tarafından yakalanmazsa, platform geneli {@code
     * GlobalExceptionHandler}'ın genel {@code Exception.class}
     * yakalayıcısına düşüp yanlışlıkla 500 döner.
     */
    @ExceptionHandler(AuthorizationDeniedException.class)
    ProblemDetail handleAuthorizationDenied(AuthorizationDeniedException ex) {
        ProblemDetail problem =
                ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Bu işlemi yapmaya yetkiniz yok.");
        problem.setTitle("Erişim reddedildi");
        return problem;
    }
}
