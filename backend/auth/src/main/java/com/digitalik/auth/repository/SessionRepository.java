package com.digitalik.auth.repository;

import com.digitalik.auth.entity.Session;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionRepository extends JpaRepository<Session, Long> {

    Optional<Session> findByToken(String token);
}
