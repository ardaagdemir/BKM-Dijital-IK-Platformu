package com.digitalik.auth.controller;

import com.digitalik.auth.dto.AssignRoleRequest;
import com.digitalik.auth.dto.RoleResponse;
import com.digitalik.auth.entity.Role;
import com.digitalik.auth.service.UserRoleService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-02.2.2: Bir kullanıcının rollerini yönetme.
 *
 * <p>US-02.2.3: Rol atama/kaldırma yalnızca {@link Role#ADMIN} rolüne sahip
 * kimlik doğrulanmış kullanıcılara açıktır ({@code @PreAuthorize}) — yetkisiz
 * istek 403 ile reddedilir. Listeleme (GET) şimdilik yalnızca "kimlik
 * doğrulanmış olma" gerektirir (bkz. {@code SecurityConfig}); "yalnızca kendi
 * rollerini görme" gibi daha ince bir kısıtlama, ihtiyaç netleşmeden
 * eklenmemiştir (YAGNI).
 */
@RestController
@RequestMapping("/api/auth/users/{userId}/roles")
public class UserRoleController {

    private final UserRoleService userRoleService;

    public UserRoleController(UserRoleService userRoleService) {
        this.userRoleService = userRoleService;
    }

    @GetMapping
    public List<RoleResponse> getRoles(@PathVariable Long userId) {
        return userRoleService.getRoles(userId).stream()
                .map(role -> new RoleResponse(role.getCode()))
                .toList();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> assignRole(@PathVariable Long userId, @RequestBody AssignRoleRequest request) {
        userRoleService.assignRole(userId, request.roleCode());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{roleCode}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> removeRole(@PathVariable Long userId, @PathVariable String roleCode) {
        userRoleService.removeRole(userId, roleCode);
        return ResponseEntity.noContent().build();
    }
}
