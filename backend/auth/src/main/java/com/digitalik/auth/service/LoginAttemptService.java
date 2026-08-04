package com.digitalik.auth.service;

import com.digitalik.auth.entity.User;
import com.digitalik.auth.exception.AccountLockedException;
import com.digitalik.auth.repository.UserRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * US-02.1.4: Art arda başarısız giriş denemelerinde hesabı geçici olarak kilitler.
 */
@Service
public class LoginAttemptService {

    private final UserRepository userRepository;
    private final int maxFailedAttempts;
    private final long lockoutMinutes;

    public LoginAttemptService(UserRepository userRepository,
            @Value("${app.security.max-failed-attempts:5}") int maxFailedAttempts,
            @Value("${app.security.lockout-duration-minutes:15}") long lockoutMinutes) {
        this.userRepository = userRepository;
        this.maxFailedAttempts = maxFailedAttempts;
        this.lockoutMinutes = lockoutMinutes;
    }

    public void assertNotLocked(User user) {
        if (user.isLocked()) {
            throw new AccountLockedException(user.getLockedUntil());
        }
    }

    public void recordFailure(User user) {
        user.incrementFailedAttempts();
        if (user.getFailedLoginAttempts() >= maxFailedAttempts) {
            user.lock(Instant.now().plus(lockoutMinutes, ChronoUnit.MINUTES));
        }
        userRepository.save(user);
    }

    public void recordSuccess(User user) {
        if (user.getFailedLoginAttempts() > 0 || user.getLockedUntil() != null) {
            user.resetLockout();
            userRepository.save(user);
        }
    }
}
