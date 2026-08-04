package com.digitalik.discipline.exception;

import com.digitalik.discipline.controller.WarningController;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * US-08C.1.2: {@code discipline} modülünün İLK {@code NotFoundException}/
 * {@code @RestControllerAdvice}'ı — {@link DisciplinaryCaseNotFoundException}
 * → {@link ProblemDetail} eşlemesi. US-08C.1.1'de (yalnızca oluşturma/
 * listeleme) gerek yoktu.
 *
 * <p>{@code basePackageClasses}, {@code WarningController} ile AYNI
 * PAKETTEKİ ({@code com.digitalik.discipline.controller}) tüm
 * controller'lara uygulanır — {@code travel.TravelExceptionHandler}'daki
 * aynı gerekçe.
 *
 * <p><b>{@code @Order} zorunludur:</b> US-02.1.3'te canlıda yaşanan
 * hatadan çıkarılan ders — her yeni modül bunu tekrarlamalı, aksi halde
 * platform geneli {@code GlobalExceptionHandler}'ın genel {@code
 * Exception.class} yakalayıcısının gerisine düşüp 500 döner.
 */
@RestControllerAdvice(basePackageClasses = WarningController.class)
@Order(Ordered.HIGHEST_PRECEDENCE)
class DisciplineExceptionHandler {

    @ExceptionHandler(DisciplinaryCaseNotFoundException.class)
    ProblemDetail handleDisciplinaryCaseNotFound(DisciplinaryCaseNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Ceza süreci bulunamadı");
        return problem;
    }
}
