package com.digitalik.auth.security;

import com.digitalik.auth.entity.Role;
import com.digitalik.auth.entity.Session;
import com.digitalik.auth.entity.User;
import com.digitalik.auth.repository.UserRepository;
import com.digitalik.auth.service.SessionService;
import com.digitalik.auth.service.UserRoleService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * US-02.2.3: Her isteği {@code Authorization: Bearer <token>} başlığına göre
 * kimliklendirir. Token yoksa/geçersizse basitçe kimliksiz devam eder — 401/403
 * kararını bu sınıf değil, {@link SecurityConfig}'in yetkilendirme kuralları ve
 * özel {@code AuthenticationEntryPoint}/{@code AccessDeniedHandler}'ı verir.
 *
 * <p>{@code @Component} DEĞİLDİR — {@link SecurityConfig} içinde elle
 * örneklenip filtre zincirine eklenir; aksi halde Spring Boot bunu hem
 * güvenlik zincirine hem de genel servlet filtre listesine iki kez kaydeder.
 */
public class TokenAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final SessionService sessionService;
    private final UserRepository userRepository;
    private final UserRoleService userRoleService;

    public TokenAuthenticationFilter(SessionService sessionService, UserRepository userRepository,
            UserRoleService userRoleService) {
        this.sessionService = sessionService;
        this.userRepository = userRepository;
        this.userRoleService = userRoleService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith(BEARER_PREFIX)) {
            authenticate(header.substring(BEARER_PREFIX.length()));
        }
        chain.doFilter(request, response);
    }

    private void authenticate(String token) {
        try {
            Session session = sessionService.validate(token);
            User user = userRepository.findById(session.getUserId()).orElse(null);
            if (user == null) {
                return;
            }

            Set<String> roleCodes = userRoleService.getRoles(user.getId()).stream()
                    .map(Role::getCode)
                    .collect(Collectors.toSet());

            AuthenticatedUser principal = new AuthenticatedUser(user.getId(), user.getEmail(), token, roleCodes);
            var authorities = roleCodes.stream()
                    .map(code -> (GrantedAuthority) new SimpleGrantedAuthority("ROLE_" + code))
                    .toList();

            var authentication = new UsernamePasswordAuthenticationToken(principal, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (RuntimeException ex) {
            // Geçersiz/süresi dolmuş/iptal edilmiş token — kimliksiz devam edilir.
        }
    }
}
