package com.digitalik.core.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * US-01.2.2: Tüm API hatalarının tek, standart bir JSON yapısıyla (RFC 7807
 * {@link ProblemDetail}) dönmesini sağlar. {@code spring.mvc.problemdetails.enabled=true}
 * ayarı, Spring'in kendi ürettiği hataları (404, 405 vb.) da aynı formata çevirir; bu
 * sınıf ise uygulama kodunun fırlattığı istisnaları aynı formata eşler.
 *
 * <p>Bu sınıfta yalnızca gerçekten platform geneli, hiçbir modüle özel olmayan
 * eşlemeler bulunur. Modüle özgü istisnalar (ör. {@code auth.InvalidCredentialsException})
 * burada ele alınmaz — her modül kendi istisnalarını, kendi paketinde, kendi
 * {@code @RestControllerAdvice}'ıyla eşler (bkz. {@code auth.AuthExceptionHandler}).
 * Ayrıca {@code core} modülü {@code auth}'a (veya başka bir iş modülüne) Maven
 * bağımlılığı olarak bağlı değildir — bu sınıf başka bir modülün istisna türünü
 * içe aktaramaz bile (bkz. docs/02-solution-architecture.md ADR-002).
 *
 * <p><b>{@code @Order(LOWEST_PRECEDENCE)} kasıtlıdır ve zorunludur:</b> Bu sınıfın
 * genel {@code Exception.class} yakalayıcısı, {@code @Order} verilmeyen HERHANGİ bir
 * modül-özel {@code @RestControllerAdvice} ile eşit önceliğe düşer; bu durumda hangisinin
 * önce tarandığı (dolayısıyla hangisinin kazandığı) classpath/kayıt sırasına bağlı,
 * garantisiz bir davranıştır — canlıda gerçekten yaşanmış, modül-özel 401 eşlemelerinin
 * sessizce buraya (500) düşmesine yol açan bir hataydı. Her yeni modülün kendi
 * {@code @RestControllerAdvice}'ı {@code @Order(Ordered.HIGHEST_PRECEDENCE)} (veya bu
 * sınıftan daha düşük bir değer) taşımalıdır — bkz. {@code auth.AuthExceptionHandler}.
 */
@RestControllerAdvice
@Order(Ordered.LOWEST_PRECEDENCE)
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(IllegalArgumentException.class)
    public ProblemDetail handleIllegalArgument(IllegalArgumentException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
        problem.setTitle("Geçersiz istek");
        return problem;
    }

    /**
     * Var olmayan bir yola yapılan istek Spring MVC'de {@link NoResourceFoundException}
     * (404) fırlatır — bu, aşağıdaki genel {@code Exception.class} yakalayıcısına
     * özel bir eşleme olmadan düşerse 500'e dönüşür (canlıda yaşandı, bkz.
     * US-08D.1.4 testleri). Kendi 404 gövdesini zaten taşıdığından olduğu gibi döndürülür.
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ProblemDetail handleNoResourceFound(NoResourceFoundException ex) {
        return ex.getBody();
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleUnexpected(Exception ex) {
        log.error("Beklenmeyen hata", ex);
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR, "Beklenmeyen bir hata oluştu.");
        problem.setTitle("Sunucu hatası");
        return problem;
    }
}
