package com.digitalik.payroll.exception;

import com.digitalik.payroll.controller.PayrollItemController;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * US-08D.1.1: {@code payroll} modülünün İLK {@code NotFoundException}/
 * {@code @RestControllerAdvice}'ı — {@link PayrollItemNotFoundException}
 * → {@link ProblemDetail} eşlemesi.
 *
 * <p>{@code basePackageClasses}, {@code PayrollItemController} ile AYNI
 * PAKETTEKİ ({@code com.digitalik.payroll.controller}) tüm
 * controller'lara uygulanır — {@code travel.TravelExceptionHandler}'daki
 * aynı gerekçe.
 *
 * <p><b>{@code @Order} zorunludur:</b> US-02.1.3'te canlıda yaşanan
 * hatadan çıkarılan ders — her yeni modül bunu tekrarlamalı, aksi halde
 * platform geneli {@code GlobalExceptionHandler}'ın genel {@code
 * Exception.class} yakalayıcısının gerisine düşüp 500 döner.
 */
@RestControllerAdvice(basePackageClasses = PayrollItemController.class)
@Order(Ordered.HIGHEST_PRECEDENCE)
class PayrollExceptionHandler {

    @ExceptionHandler(PayrollItemNotFoundException.class)
    ProblemDetail handlePayrollItemNotFound(PayrollItemNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Ücret kalemi bulunamadı");
        return problem;
    }
}
