package com.digitalik.auth.service;

import com.digitalik.auth.dto.LoginResponse;
import com.digitalik.auth.dto.ProfileResponse;
import com.digitalik.auth.dto.SessionResponse;
import com.digitalik.auth.entity.Role;
import com.digitalik.auth.entity.Session;
import com.digitalik.auth.entity.User;
import com.digitalik.auth.exception.InvalidCredentialsException;
import com.digitalik.auth.exception.InvalidSessionException;
import com.digitalik.auth.exception.UserNotFoundException;
import com.digitalik.auth.repository.UserRepository;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SessionService sessionService;
    private final LoginAttemptService loginAttemptService;
    private final UserRoleService userRoleService;
    private final StepUpNotificationService stepUpNotificationService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
            SessionService sessionService, LoginAttemptService loginAttemptService,
            UserRoleService userRoleService, StepUpNotificationService stepUpNotificationService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.sessionService = sessionService;
        this.loginAttemptService = loginAttemptService;
        this.userRoleService = userRoleService;
        this.stepUpNotificationService = stepUpNotificationService;
    }

    public LoginResponse login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(InvalidCredentialsException::new);

        loginAttemptService.assertNotLocked(user);

        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            loginAttemptService.recordFailure(user);
            // Bu deneme az önce kilitlenmeye neden olduysa kullanıcıyı bilgilendir.
            loginAttemptService.assertNotLocked(user);
            throw new InvalidCredentialsException();
        }

        loginAttemptService.recordSuccess(user);

        Session session = sessionService.create(user);
        return new LoginResponse(user.getId(), user.getEmail(), session.getToken(), session.getExpiresAt());
    }

    public SessionResponse getSession(String token) {
        Session session = sessionService.validate(token);
        User user = userRepository.findById(session.getUserId())
                .orElseThrow(InvalidSessionException::new);
        return new SessionResponse(user.getId(), user.getEmail(), session.getExpiresAt());
    }

    public void logout(String token) {
        sessionService.invalidate(token);
    }

    /** US-02.2.4: Giriş yapmış kullanıcının kendi profil bilgileri (ad, e-posta, rol). */
    public ProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);
        Set<String> roles = userRoleService.getRoles(userId).stream()
                .map(Role::getCode)
                .collect(Collectors.toSet());
        return new ProfileResponse(user.getId(), user.getEmail(), user.getFullName(), roles);
    }

    /**
     * US-08D.1.4: Bordro modülüne erişim için ek doğrulama (2FA) kodu
     * ister — kod, oturum sahibinin e-postasına gönderilir.
     */
    public void requestPayrollAccess(String token) {
        Session session = sessionService.requestStepUp(token);
        User user = userRepository.findById(session.getUserId()).orElseThrow(InvalidSessionException::new);
        stepUpNotificationService.sendStepUpCode(user.getEmail(), session.getStepUpCode());
    }

    /** US-08D.1.4: Gönderilen kodu doğrular — başarılıysa mevcut oturum bordro erişimi için "yükseltilmiş" sayılır. */
    public void verifyPayrollAccess(String token, String code) {
        sessionService.verifyStepUp(token, code);
    }
}
