package com.digitalik.leave.exception;

import com.digitalik.leave.controller.LeaveTypeController;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * US-04.1.1: {@link LeaveTypeNotFoundException}/{@link DuplicateLeaveTypeCodeException}
 * → {@link ProblemDetail} eşlemesi.
 *
 * <p>{@code basePackageClasses}, {@code LeaveTypeController} ile AYNI
 * PAKETTEKİ ({@code com.digitalik.leave.controller}) tüm controller'lara
 * uygulanır — bkz. {@code organization.exception.OrganizationExceptionHandler}'daki
 * aynı gerekçe.
 *
 * <p><b>{@code @Order} zorunludur:</b> US-02.1.3'te canlıda yaşanan hatadan
 * (bkz. {@code auth.AuthExceptionHandler}) çıkarılan ders — her yeni modül
 * bunu tekrarlamalı, aksi halde platform geneli {@code GlobalExceptionHandler}'ın
 * genel {@code Exception.class} yakalayıcısının gerisine düşüp 500 döner.
 */
@RestControllerAdvice(basePackageClasses = LeaveTypeController.class)
@Order(Ordered.HIGHEST_PRECEDENCE)
class LeaveExceptionHandler {

    @ExceptionHandler(LeaveTypeNotFoundException.class)
    ProblemDetail handleLeaveTypeNotFound(LeaveTypeNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("İzin türü bulunamadı");
        return problem;
    }

    @ExceptionHandler(DuplicateLeaveTypeCodeException.class)
    ProblemDetail handleDuplicateLeaveTypeCode(DuplicateLeaveTypeCodeException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
        problem.setTitle("İzin türü zaten kayıtlı");
        return problem;
    }

    @ExceptionHandler(LeaveRequestNotFoundException.class)
    ProblemDetail handleLeaveRequestNotFound(LeaveRequestNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("İzin talebi bulunamadı");
        return problem;
    }

    /**
     * US-04.2.2: {@code organization.OrganizationExceptionHandler}'daki (US-03.2.6)
     * aynı ders — {@code @PreAuthorize} reddi bu modülün kendi advice'ı
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
