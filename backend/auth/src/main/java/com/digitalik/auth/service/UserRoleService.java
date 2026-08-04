package com.digitalik.auth.service;

import com.digitalik.auth.entity.Role;
import com.digitalik.auth.entity.UserRole;
import com.digitalik.auth.exception.RoleNotFoundException;
import com.digitalik.auth.exception.UserNotFoundException;
import com.digitalik.auth.repository.RoleRepository;
import com.digitalik.auth.repository.UserRepository;
import com.digitalik.auth.repository.UserRoleRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-02.2.2: Kullanıcıya rol atama/kaldırma. Roller kalıcı olarak
 * {@code Session}/{@code SessionResponse} gibi herhangi bir token/önbelleğe
 * gömülmediği için, atama/kaldırma her zaman bir sonraki DB sorgusunda
 * (dolayısıyla bir sonraki istekte) etkili olur — ayrıca bir "önbellek geçersiz
 * kılma" adımına gerek yoktur.
 */
@Service
public class UserRoleService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;

    public UserRoleService(UserRepository userRepository, RoleRepository roleRepository,
            UserRoleRepository userRoleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
    }

    public List<Role> getRoles(Long userId) {
        assertUserExists(userId);
        return userRoleRepository.findByUserIdAndRevokedAtIsNull(userId).stream()
                .map(userRole -> roleRepository.findById(userRole.getRoleId())
                        .orElseThrow(RoleNotFoundException::new))
                .toList();
    }

    public void assignRole(Long userId, String roleCode) {
        assertUserExists(userId);
        Role role = roleRepository.findByCode(roleCode).orElseThrow(RoleNotFoundException::new);

        boolean alreadyActive = userRoleRepository
                .findByUserIdAndRoleIdAndRevokedAtIsNull(userId, role.getId())
                .isPresent();
        if (!alreadyActive) {
            userRoleRepository.save(new UserRole(userId, role.getId()));
        }
    }

    public void removeRole(Long userId, String roleCode) {
        assertUserExists(userId);
        Role role = roleRepository.findByCode(roleCode).orElseThrow(RoleNotFoundException::new);

        userRoleRepository.findByUserIdAndRoleIdAndRevokedAtIsNull(userId, role.getId())
                .ifPresent(userRole -> {
                    userRole.revoke();
                    userRoleRepository.save(userRole);
                });
    }

    private void assertUserExists(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException();
        }
    }
}
