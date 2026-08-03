package com.digitalik.amenities.exception;

import com.digitalik.amenities.controller.ClubController;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * {@code amenities} modülünün tüm {@code NotFoundException}/{@code @RestControllerAdvice}'ı —
 * eskiden ayrı {@code club.ClubExceptionHandler} (US-08G.1.1/1.2) ve {@code
 * appointment.AppointmentExceptionHandler} (US-08H.1.1/1.2/1.3) idi; modül birleşince tek sınıfa
 * indirgendi (aynı pakette tek bir advice yeterli — {@code feedback.FeedbackExceptionHandler}'daki
 * AYNI birleşme deseni).
 *
 * <p>{@code basePackageClasses}, {@code ClubController} ile AYNI PAKETTEKİ ({@code
 * com.digitalik.amenities.controller}) TÜM controller'lara (hem kulüp hem randevu) uygulanır.
 *
 * <p><b>{@code @Order} zorunludur:</b> US-02.1.3'te canlıda yaşanan hatadan çıkarılan ders — her
 * modül bunu tekrarlamalı, aksi halde platform geneli {@code GlobalExceptionHandler}'ın genel
 * {@code Exception.class} yakalayıcısının gerisine düşüp 500 döner. {@link
 * AuthorizationDeniedException} eşlemesi de AYNI nedenle burada zorunlu — {@code
 * AppointmentNoteController}'ın {@code @PreAuthorize}'ı bu modülde.
 */
@RestControllerAdvice(basePackageClasses = ClubController.class)
@Order(Ordered.HIGHEST_PRECEDENCE)
class AmenitiesExceptionHandler {

    @ExceptionHandler(ClubNotFoundException.class)
    ProblemDetail handleClubNotFound(ClubNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Kulüp bulunamadı");
        return problem;
    }

    @ExceptionHandler(ClubMembershipRequestNotFoundException.class)
    ProblemDetail handleClubMembershipRequestNotFound(ClubMembershipRequestNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Üyelik talebi bulunamadı");
        return problem;
    }

    /** US-08G.1.2: İsteği yapan lider olmadığında (bkz. {@code ClubEventService.create}). */
    @ExceptionHandler(NotClubLeaderException.class)
    ProblemDetail handleNotClubLeader(NotClubLeaderException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, ex.getMessage());
        problem.setTitle("Yetkisiz işlem");
        return problem;
    }

    @ExceptionHandler(ServiceOfferingNotFoundException.class)
    ProblemDetail handleServiceOfferingNotFound(ServiceOfferingNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Hizmet bulunamadı");
        return problem;
    }

    /** US-08H.1.2: Olmayan bir slota randevu alınmaya çalışıldığında. */
    @ExceptionHandler(AppointmentSlotNotFoundException.class)
    ProblemDetail handleAppointmentSlotNotFound(AppointmentSlotNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Slot bulunamadı");
        return problem;
    }

    /** US-08H.1.3: Olmayan bir randevunun notu okunmaya/güncellenmeye çalışıldığında. */
    @ExceptionHandler(AppointmentNotFoundException.class)
    ProblemDetail handleAppointmentNotFound(AppointmentNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Randevu bulunamadı");
        return problem;
    }

    /**
     * US-08H.1.3 (SEC-020): {@code organization.OrganizationExceptionHandler}'daki
     * (US-03.2.6) AYNI ders — {@code @PreAuthorize} reddi ({@link
     * AuthorizationDeniedException}) bu modülün kendi advice'ı tarafından
     * yakalanmazsa, platform geneli {@code GlobalExceptionHandler}'ın genel
     * {@code Exception.class} yakalayıcısına düşüp yanlışlıkla 500 döner.
     */
    @ExceptionHandler(AuthorizationDeniedException.class)
    ProblemDetail handleAuthorizationDenied(AuthorizationDeniedException ex) {
        ProblemDetail problem =
                ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Bu işlemi yapmaya yetkiniz yok.");
        problem.setTitle("Erişim reddedildi");
        return problem;
    }
}
