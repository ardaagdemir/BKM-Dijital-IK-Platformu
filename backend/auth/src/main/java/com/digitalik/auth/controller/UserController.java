package com.digitalik.auth.controller;

import com.digitalik.auth.dto.UserSummaryResponse;
import com.digitalik.auth.entity.Role;
import com.digitalik.auth.entity.User;
import com.digitalik.auth.repository.UserRepository;
import com.digitalik.auth.service.UserRoleService;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Bölüm 14.1 (frontend roadmap'inin ÖNERDİĞİ backend ön-koşulu):
 * {@code /admin/users/:id/roles} sayfasının bir kullanıcı SEÇEBİLMESİ için
 * gereken dizin ucu — {@link UserRoleController} yalnızca ZATEN bilinen bir
 * {@code userId} üzerinde çalışıyor, kullanıcıyı BULACAK bir uç yoktu (ekran
 * yalnızca ham bir ID ile ulaşılabilir olurdu). Kullanıcı sayısı küçük
 * (manuel provizyon, bkz. {@code EmployeeAccessGuard}'ın AYNI notu) olduğundan
 * sayfalama YOK — {@code organization.listUnits/listJobTitles} ile AYNI
 * "düz liste" deseni.
 */
@RestController
@RequestMapping("/api/auth/users")
public class UserController {

    private final UserRepository userRepository;
    private final UserRoleService userRoleService;

    public UserController(UserRepository userRepository, UserRoleService userRoleService) {
        this.userRepository = userRepository;
        this.userRoleService = userRoleService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserSummaryResponse> list() {
        return userRepository.findAll().stream().map(this::toSummary).toList();
    }

    private UserSummaryResponse toSummary(User user) {
        List<String> roles = userRoleService.getRoles(user.getId()).stream().map(Role::getCode).toList();
        return new UserSummaryResponse(user.getId(), user.getEmail(), user.getFullName(), roles);
    }
}
