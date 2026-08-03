package com.digitalik.auth.security;

import com.digitalik.auth.service.SessionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * US-08D.1.4: "Bordro ekranına girişte ikinci faktör istenir." —
 * {@code /api/payroll/**} altındaki HERHANGİ bir uca, kimlik doğrulanmış
 * ama oturumu HENÜZ step-up doğrulanmamış bir istekle erişilmeye
 * çalışıldığında 403 döner.
 *
 * <p>Genel bir "step-up gerektiren yollar listesi" yapılandırması İCAT
 * EDİLMEDİ — bugün tek tüketici bordro olduğundan yol öneki doğrudan
 * sabit kodlandı (YAGNI); ikinci bir modül aynı ihtiyacı duyarsa o zaman
 * genelleştirilir.
 *
 * <p>{@code /api/auth/payroll-access/*} (kodu isteme/doğrulama uçlarının
 * kendisi) bu önekin DIŞINDA olduğundan (path {@code /api/auth/...}, {@code
 * /api/payroll/...} DEĞİL) döngüsel bir kilitlenme oluşmaz.
 *
 * <p>{@code @Component} DEĞİLDİR — {@code TokenAuthenticationFilter}'daki
 * (US-02.2.3) AYNI gerekçeyle {@link SecurityConfig} içinde elle
 * örneklenip filtre zincirine eklenir.
 */
public class PayrollStepUpFilter extends OncePerRequestFilter {

    private static final String PAYROLL_PATH_PREFIX = "/api/payroll/";

    private final SessionService sessionService;
    private final ObjectMapper objectMapper;

    public PayrollStepUpFilter(SessionService sessionService, ObjectMapper objectMapper) {
        this.sessionService = sessionService;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if (!request.getRequestURI().startsWith(PAYROLL_PATH_PREFIX)) {
            chain.doFilter(request, response);
            return;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser principal) {
            if (!isStepUpVerified(principal.token())) {
                writeStepUpRequiredProblem(response);
                return;
            }
        }
        // Kimlik doğrulanmamış istekler burada BİLİNÇLİ OLARAK engellenmiyor —
        // o karar zaten SecurityConfig'in "anyRequest().authenticated()" kuralına
        // ve authenticationEntryPoint'ine (401) bırakılıyor.

        chain.doFilter(request, response);
    }

    private boolean isStepUpVerified(String token) {
        try {
            return sessionService.validate(token).isStepUpVerified();
        } catch (RuntimeException ex) {
            return false;
        }
    }

    private void writeStepUpRequiredProblem(HttpServletResponse response) throws IOException {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.FORBIDDEN, "Bu modüle erişim için ek doğrulama (2FA) gereklidir.");
        problem.setTitle("Ek doğrulama gerekli");
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), problem);
    }
}
