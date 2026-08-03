package com.digitalik.travel.exception;

import com.digitalik.travel.controller.TravelRequestController;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * US-08B.1.2: {@link TravelRequestNotFoundException} → {@link ProblemDetail} eşlemesi.
 *
 * <p>{@code basePackageClasses}, {@code TravelRequestController} ile AYNI
 * PAKETTEKİ ({@code com.digitalik.travel.controller}) tüm controller'lara
 * uygulanır (bkz. {@code organization.OrganizationExceptionHandler}'daki
 * aynı gerekçe).
 *
 * <p><b>{@code @Order} zorunludur:</b> US-02.1.3'te canlıda yaşanan hatadan
 * çıkarılan ders — her yeni modül bunu tekrarlamalı, aksi halde platform
 * geneli {@code GlobalExceptionHandler}'ın genel {@code Exception.class}
 * yakalayıcısının gerisine düşüp 500 döner.
 */
@RestControllerAdvice(basePackageClasses = TravelRequestController.class)
@Order(Ordered.HIGHEST_PRECEDENCE)
class TravelExceptionHandler {

    @ExceptionHandler(TravelRequestNotFoundException.class)
    ProblemDetail handleTravelRequestNotFound(TravelRequestNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Seyahat talebi bulunamadı");
        return problem;
    }

    /** US-08B.1.3: Olmayan bir masraf kalemi karara bağlanmaya çalışıldığında. */
    @ExceptionHandler(ExpenseItemNotFoundException.class)
    ProblemDetail handleExpenseItemNotFound(ExpenseItemNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Masraf kalemi bulunamadı");
        return problem;
    }
}
