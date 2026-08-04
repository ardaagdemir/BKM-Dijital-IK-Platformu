package com.digitalik.attendance.exception;

import com.digitalik.attendance.controller.WorkModelController;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * US-07.1.1: {@link WorkModelNotFoundException} → {@link ProblemDetail} eşlemesi.
 *
 * <p>{@code basePackageClasses}, {@code WorkModelController} ile AYNI
 * PAKETTEKİ ({@code com.digitalik.attendance.controller}) tüm controller'lara
 * uygulanır (bkz. {@code organization.OrganizationExceptionHandler}'daki
 * aynı gerekçe).
 *
 * <p><b>{@code @Order} zorunludur:</b> US-02.1.3'te canlıda yaşanan hatadan
 * çıkarılan ders — her yeni modül bunu tekrarlamalı, aksi halde platform
 * geneli {@code GlobalExceptionHandler}'ın genel {@code Exception.class}
 * yakalayıcısının gerisine düşüp 500 döner.
 */
@RestControllerAdvice(basePackageClasses = WorkModelController.class)
@Order(Ordered.HIGHEST_PRECEDENCE)
class AttendanceExceptionHandler {

    @ExceptionHandler(WorkModelNotFoundException.class)
    ProblemDetail handleWorkModelNotFound(WorkModelNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Çalışma modeli bulunamadı");
        return problem;
    }

    /** US-07.1.2: Bir çalışan için henüz atama yapılmadan {@code GET} çağrıldığında. */
    @ExceptionHandler(WorkModelAssignmentNotFoundException.class)
    ProblemDetail handleWorkModelAssignmentNotFound(WorkModelAssignmentNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Çalışma modeli ataması bulunamadı");
        return problem;
    }
}
