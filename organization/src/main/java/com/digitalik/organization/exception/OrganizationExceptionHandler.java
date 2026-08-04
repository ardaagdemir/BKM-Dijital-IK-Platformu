package com.digitalik.organization.exception;

import com.digitalik.organization.controller.OrganizationUnitController;
import com.digitalik.platform.file.InfectedFileException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * US-03.1.1/US-03.1.2: {@link OrganizationUnitNotFoundException} ve
 * {@link JobTitleNotFoundException} → {@link ProblemDetail} eşlemesi.
 *
 * <p>{@code basePackageClasses}, {@code OrganizationUnitController} ile AYNI
 * PAKETTEKİ ({@code com.digitalik.organization.controller}) tüm
 * controller'lara uygulanır — bu yüzden bu modüldeki her yeni controller için
 * ayrı bir advice sınıfı açmaya gerek yok (bkz. {@code core.exception.GlobalExceptionHandler}'daki gerekçe).
 *
 * <p><b>{@code @Order} zorunludur:</b> bkz. {@code auth.AuthExceptionHandler}'daki
 * ayrıntılı not — canlıda yaşanmış, {@code @Order} verilmeyen modül-özel
 * advice'ların platform geneli {@code GlobalExceptionHandler}'ın genel
 * {@code Exception.class} yakalayıcısının gerisine düşmesi hatasını
 * tekrarlamamak için her yeni modül bunu uygulamalıdır.
 */
@RestControllerAdvice(basePackageClasses = OrganizationUnitController.class)
@Order(Ordered.HIGHEST_PRECEDENCE)
class OrganizationExceptionHandler {

    @ExceptionHandler(OrganizationUnitNotFoundException.class)
    ProblemDetail handleOrganizationUnitNotFound(OrganizationUnitNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Birim bulunamadı");
        return problem;
    }

    @ExceptionHandler(JobTitleNotFoundException.class)
    ProblemDetail handleJobTitleNotFound(JobTitleNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Unvan bulunamadı");
        return problem;
    }

    @ExceptionHandler(DuplicateNationalIdException.class)
    ProblemDetail handleDuplicateNationalId(DuplicateNationalIdException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
        problem.setTitle("Çalışan zaten kayıtlı");
        return problem;
    }

    @ExceptionHandler(EmployeeNotFoundException.class)
    ProblemDetail handleEmployeeNotFound(EmployeeNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Çalışan bulunamadı");
        return problem;
    }

    @ExceptionHandler(EmployeeProfileNotFoundException.class)
    ProblemDetail handleEmployeeProfileNotFound(EmployeeProfileNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Özlük bilgisi bulunamadı");
        return problem;
    }

    @ExceptionHandler(EmployeeAssetNotFoundException.class)
    ProblemDetail handleEmployeeAssetNotFound(EmployeeAssetNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Zimmet kaydı bulunamadı");
        return problem;
    }

    /** Eskiden ayrı {@code document.DocumentExceptionHandler}'daydı (US-08I.1.1) — `document` → `organization` modül birleştirmesiyle taşındı. */
    @ExceptionHandler(PolicyDocumentNotFoundException.class)
    ProblemDetail handlePolicyDocumentNotFound(PolicyDocumentNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Doküman bulunamadı");
        return problem;
    }

    /** US-09.7.2: Yüklenen dosya enfekte tespit edildiğinde (bkz. {@code PolicyDocumentService}). */
    @ExceptionHandler(InfectedFileException.class)
    ProblemDetail handleInfectedFile(InfectedFileException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage());
        problem.setTitle("Dosya reddedildi");
        return problem;
    }

    /**
     * US-03.2.6: {@code auth.AuthExceptionHandler}'daki aynı ders burada da
     * geçerli — {@code @PreAuthorize} reddi ({@link AuthorizationDeniedException})
     * bu modülün kendi advice'ı tarafından yakalanmazsa, platform geneli
     * {@code GlobalExceptionHandler}'ın genel {@code Exception.class}
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
