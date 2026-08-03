package com.digitalik.auth.exception;

import com.digitalik.auth.controller.AuthController;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * US-02.1.1/US-02.1.3/US-02.1.4: {@link InvalidCredentialsException},
 * {@link InvalidSessionException} ve {@link AccountLockedException} → {@link ProblemDetail}
 * eşlemesi.
 *
 * <p>{@code basePackageClasses} ile yalnızca bu modülün controller'larına
 * ({@link AuthController}) uygulanır; platform geneli
 * {@code com.digitalik.exception.GlobalExceptionHandler}'ın her modülün istisna
 * türünü bilmesi gerekmez (bkz. o sınıftaki not).
 *
 * <p><b>{@code @Order} zorunludur:</b> Spring, eşit önceliğe sahip birden fazla
 * {@code @RestControllerAdvice} arasında seçimi (bir advice bir eşleşme bulduğunda
 * diğerlerine bakmaz) TARAMA/KAYIT SIRASINA göre yapar — bu sıra, çok modüllü
 * (ayrı jar'lar) bir derlemede modüllerin classpath sırasına bağlıdır ve garanti
 * değildir. Bu, canlı ortamda gerçekten yaşanan bir hataydı: modül-özel bu advice,
 * platform geneli {@code GlobalExceptionHandler}'ın genel {@code Exception.class}
 * yakalayıcısının GERİSİNDE taranınca, bu sınıftaki 401 eşlemeleri hiç
 * çalışmadan hepsi yanlışlıkla 500'e düşüyordu. {@code @Order(HIGHEST_PRECEDENCE)}
 * bu modülün her zaman önce kontrol edilmesini garanti eder.
 */
@RestControllerAdvice(basePackageClasses = AuthController.class)
@Order(Ordered.HIGHEST_PRECEDENCE)
class AuthExceptionHandler {

    @ExceptionHandler(InvalidCredentialsException.class)
    ProblemDetail handleInvalidCredentials(InvalidCredentialsException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, ex.getMessage());
        problem.setTitle("Kimlik doğrulama başarısız");
        return problem;
    }

    @ExceptionHandler(InvalidSessionException.class)
    ProblemDetail handleInvalidSession(InvalidSessionException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, ex.getMessage());
        problem.setTitle("Oturum geçersiz");
        return problem;
    }

    @ExceptionHandler(AccountLockedException.class)
    ProblemDetail handleAccountLocked(AccountLockedException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.LOCKED, ex.getMessage());
        problem.setTitle("Hesap kilitli");
        problem.setProperty("lockedUntil", ex.getLockedUntil());
        return problem;
    }

    @ExceptionHandler(UserNotFoundException.class)
    ProblemDetail handleUserNotFound(UserNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Kullanıcı bulunamadı");
        return problem;
    }

    @ExceptionHandler(RoleNotFoundException.class)
    ProblemDetail handleRoleNotFound(RoleNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Rol bulunamadı");
        return problem;
    }

    /**
     * US-02.2.3: {@code @PreAuthorize} reddi ({@link AuthorizationDeniedException})
     * bir controller metodu çağrısı SIRASINDA (AOP) fırlatılır; DispatcherServlet
     * bunu {@code ExceptionHandlerExceptionResolver} ile burada çözer ve bu nedenle
     * {@code SecurityConfig}'teki {@code accessDeniedHandler}'a hiç ulaşmaz (o
     * yalnızca filtre zincirinde — handler çağrısından ÖNCE/dışında — yakalanan
     * hatalar içindir). Tutarlılık için aynı mesaj biçimi kullanılır.
     */
    @ExceptionHandler(AuthorizationDeniedException.class)
    ProblemDetail handleAuthorizationDenied(AuthorizationDeniedException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.FORBIDDEN, "Bu işlemi yapmaya yetkiniz yok.");
        problem.setTitle("Erişim reddedildi");
        return problem;
    }
}
