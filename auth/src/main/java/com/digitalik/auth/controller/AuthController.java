package com.digitalik.auth.controller;

import com.digitalik.auth.dto.LoginRequest;
import com.digitalik.auth.dto.LoginResponse;
import com.digitalik.auth.dto.ProfileResponse;
import com.digitalik.auth.dto.SessionResponse;
import com.digitalik.auth.dto.VerifyPayrollAccessRequest;
import com.digitalik.auth.security.AuthenticatedUser;
import com.digitalik.auth.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * {@code /session}, {@code /logout} ve {@code /me}, US-02.2.3 kapsamında artık
 * kendi token ayrıştırmalarını yapmıyor — kimlik doğrulama
 * {@code security.TokenAuthenticationFilter} tarafından istek daha controller'a
 * ulaşmadan yapılıyor; geçerli bir token yoksa istek 401 ile reddedilir ve bu
 * metotlar hiç çalışmaz (bkz. {@code security.SecurityConfig}).
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authService.login(request.email(), request.password());
    }

    @GetMapping("/session")
    public SessionResponse session(@AuthenticationPrincipal AuthenticatedUser principal) {
        return authService.getSession(principal.token());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal AuthenticatedUser principal) {
        authService.logout(principal.token());
        return ResponseEntity.noContent().build();
    }

    /** US-02.2.4: Giriş yapan kullanıcının kendi profil bilgileri (ad, e-posta, rol). */
    @GetMapping("/me")
    public ProfileResponse me(@AuthenticationPrincipal AuthenticatedUser principal) {
        return authService.getProfile(principal.userId());
    }

    /**
     * US-08D.1.4: Bordro modülüne erişim için ek doğrulama (2FA) kodu
     * ister — kod, kullanıcının e-postasına gönderilir. Gerçek uygulama
     * ({@code security.PayrollStepUpFilter}), kodun doğrulanmasını
     * {@code /api/payroll/**} altındaki uçlar için ZORUNLU kılar.
     */
    @PostMapping("/payroll-access/request")
    public ResponseEntity<Void> requestPayrollAccess(@AuthenticationPrincipal AuthenticatedUser principal) {
        authService.requestPayrollAccess(principal.token());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/payroll-access/verify")
    public ResponseEntity<Void> verifyPayrollAccess(
            @AuthenticationPrincipal AuthenticatedUser principal, @RequestBody VerifyPayrollAccessRequest request) {
        authService.verifyPayrollAccess(principal.token(), request.code());
        return ResponseEntity.noContent().build();
    }
}
