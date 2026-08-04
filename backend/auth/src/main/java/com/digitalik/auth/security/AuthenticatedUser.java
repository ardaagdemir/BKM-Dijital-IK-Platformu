package com.digitalik.auth.security;

import java.util.Set;
import org.springframework.security.core.AuthenticatedPrincipal;

/**
 * US-02.2.3: {@link TokenAuthenticationFilter} tarafından geçerli bir token
 * için oluşturulan, Spring Security {@code Authentication}'ının principal'ı.
 * {@code @AuthenticationPrincipal AuthenticatedUser} ile herhangi bir
 * controller metodunda enjekte edilebilir.
 *
 * <p>US-03.2.6: {@link AuthenticatedPrincipal} arayüzü kasıtlı olarak
 * uygulandı — bu sayede {@code Authentication.getName()}
 * ({@code AbstractAuthenticationToken.getName()}, principal
 * {@code AuthenticatedPrincipal} ise onun {@code getName()}'ini kullanır) bu
 * record'un ham {@code toString()}'i yerine e-postayı döner. Bu, {@code auth}
 * modülüne bağımlı OLMAYAN diğer modüllerin (ör. {@code organization}),
 * yalnızca jenerik {@code Authentication} API'si üzerinden geçerli
 * kullanıcının kimliğine erişebilmesini sağlar — bkz.
 * {@code organization.security.EmployeeAccessGuard}.
 */
public record AuthenticatedUser(Long userId, String email, String token, Set<String> roles)
        implements AuthenticatedPrincipal {

    @Override
    public String getName() {
        return email;
    }
}
