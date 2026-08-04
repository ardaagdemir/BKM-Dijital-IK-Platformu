package com.digitalik.auth.repository;

import com.digitalik.auth.entity.UserRole;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRoleRepository extends JpaRepository<UserRole, Long> {

    List<UserRole> findByUserIdAndRevokedAtIsNull(Long userId);

    Optional<UserRole> findByUserIdAndRoleIdAndRevokedAtIsNull(Long userId, Long roleId);
}
