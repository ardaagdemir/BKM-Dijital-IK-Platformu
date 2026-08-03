package com.digitalik.auth.security;

import com.digitalik.auth.repository.UserRepository;
import com.digitalik.auth.service.SessionService;
import com.digitalik.auth.service.UserRoleService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * US-02.2.3: "Yetkisiz istek reddedilir (403)." Token/session tabanlı,
 * stateless kimlik doğrulama; hata yanıtları projenin standart
 * {@link ProblemDetail} formatında döner (bkz. core.exception.GlobalExceptionHandler).
 *
 * <p>{@code /api/auth/login} dışındaki tüm uç noktalar en az "kimlik
 * doğrulanmış olma" gerektirir; belirli roller gerektiren uç noktalar
 * ({@code @PreAuthorize}, bkz. {@code UserRoleController}) 403 ile reddeder.
 *
 * <p>US-05.2.1: {@code /api/recruitment/candidates/applications} de
 * {@code permitAll()} — "giriş yapmış İK kullanıcısından bağımsız bir
 * erişimdir" (kabul kriteri), projedeki İLK herkese açık YAZMA ucu. Bu kural
 * burada, {@code auth} modülünde tanımlı — güvenlik, uygulama genelinde tek
 * bir filtre zinciri olarak burada merkezileştiriliyor (bkz. sınıfın geri
 * kalanı); {@code recruitment} modülünün kendisi Spring Security'ye hiç
 * bağımlı değil.
 *
 * <p>US-08D.1.4: {@link PayrollStepUpFilter}, {@code TokenAuthenticationFilter}'dan
 * SONRA eklenir (kimlik zaten çözülmüş olmalı) — {@code /api/payroll/**}
 * altındaki uçlara, oturum step-up doğrulanmamışsa 403 döner.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final ObjectMapper objectMapper;

    public SecurityConfig(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, SessionService sessionService,
            UserRepository userRepository, UserRoleService userRoleService) throws Exception {

        var tokenFilter = new TokenAuthenticationFilter(sessionService, userRepository, userRoleService);
        var payrollStepUpFilter = new PayrollStepUpFilter(sessionService, objectMapper);

        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/recruitment/candidates/applications").permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(handling -> handling
                        .authenticationEntryPoint((request, response, ex) -> writeProblem(response,
                                HttpStatus.UNAUTHORIZED, "Kimlik doğrulama gerekli",
                                "Bu işlem için geçerli bir oturum tokenı gereklidir."))
                        .accessDeniedHandler((request, response, ex) -> writeProblem(response,
                                HttpStatus.FORBIDDEN, "Erişim reddedildi",
                                "Bu işlemi yapmaya yetkiniz yok.")))
                .addFilterBefore(tokenFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(payrollStepUpFilter, TokenAuthenticationFilter.class);

        return http.build();
    }

    private void writeProblem(HttpServletResponse response, HttpStatus status, String title, String detail)
            throws IOException {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setTitle(title);
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), problem);
    }
}
