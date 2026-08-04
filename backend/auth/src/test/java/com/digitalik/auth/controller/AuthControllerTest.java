package com.digitalik.auth.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.auth.dto.ConfirmMfaRequest;
import com.digitalik.auth.dto.LoginRequest;
import com.digitalik.auth.dto.VerifyPayrollAccessRequest;
import com.digitalik.auth.entity.Role;
import com.digitalik.auth.entity.Session;
import com.digitalik.auth.entity.User;
import com.digitalik.auth.entity.UserRole;
import com.digitalik.auth.repository.RoleRepository;
import com.digitalik.auth.repository.SessionRepository;
import com.digitalik.auth.repository.UserRepository;
import com.digitalik.auth.repository.UserRoleRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.samstevens.totp.code.CodeGenerator;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import java.time.Instant;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-02.1.1 kabul kriteri: "Doğru bilgiyle giriş başarılı; yanlış bilgiyle
 * anlaşılır hata döner."
 * US-02.1.3 kabul kriteri: "Token/session süresi dolunca yeniden giriş
 * istenir; çıkış işlemi oturumu geçersiz kılar."
 * US-02.1.4 kabul kriteri: "N başarısız denemeden sonra hesap kısa süreliğine
 * kilitlenir."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void dogruBilgiyleGirisBasarili() throws Exception {
        userRepository.save(new User("test@dijitalik.local", passwordEncoder.encode("Sifre123!")));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new LoginRequest("test@dijitalik.local", "Sifre123!"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@dijitalik.local"))
                .andExpect(jsonPath("$.userId").exists())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.expiresAt").exists());
    }

    @Test
    void yanlisParolaIleGirisReddedilirVeAnlasilirHataDoner() throws Exception {
        userRepository.save(new User("test2@dijitalik.local", passwordEncoder.encode("Sifre123!")));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new LoginRequest("test2@dijitalik.local", "YanlisParola"))))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.title").value("Kimlik doğrulama başarısız"));
    }

    @Test
    void olmayanKullaniciIleGirisReddedilir() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new LoginRequest("yok@dijitalik.local", "herhangi"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void gecerliTokenIleOturumBilgisiSorgulanabilir() throws Exception {
        userRepository.save(new User("session@dijitalik.local", passwordEncoder.encode("Sifre123!")));
        String token = girisYapVeTokenAl("session@dijitalik.local", "Sifre123!");

        mockMvc.perform(get("/api/auth/session").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("session@dijitalik.local"))
                .andExpect(jsonPath("$.expiresAt").exists());
    }

    @Test
    void gecersizTokenIleOturumSorgulananamaz() throws Exception {
        // Geçersiz token, controller'a hiç ulaşmadan SecurityConfig'in
        // authenticationEntryPoint'i tarafından 401 ile reddedilir (bkz.
        // TokenAuthenticationFilter: doğrulanamayan token istek anonim olarak
        // devam eder, sonra "authenticated()" kuralı isteği reddeder).
        mockMvc.perform(get("/api/auth/session").header("Authorization", "Bearer olmayan-token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.title").value("Kimlik doğrulama gerekli"));
    }

    @Test
    void authorizationBasligiEksikOlduguzamanOturumSorgulananamaz() throws Exception {
        mockMvc.perform(get("/api/auth/session"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void suresiDolmusTokenIleOturumSorgulananamaz() throws Exception {
        User user = userRepository.save(new User("expired@dijitalik.local", passwordEncoder.encode("Sifre123!")));
        Session expiredSession = sessionRepository.save(
                new Session("expired-test-token", user.getId(), Instant.now().minusSeconds(60)));

        mockMvc.perform(get("/api/auth/session").header("Authorization", "Bearer " + expiredSession.getToken()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void cikisYapildiktanSonraTokenGecersizOlur() throws Exception {
        userRepository.save(new User("logout@dijitalik.local", passwordEncoder.encode("Sifre123!")));
        String token = girisYapVeTokenAl("logout@dijitalik.local", "Sifre123!");

        mockMvc.perform(post("/api/auth/logout").header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/auth/session").header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void besBasarisizDenemedenSonraHesapKilitlenir() throws Exception {
        userRepository.save(new User("lockout@dijitalik.local", passwordEncoder.encode("Sifre123!")));

        for (int i = 0; i < 4; i++) {
            yanlisParolaIleGirisDene("lockout@dijitalik.local").andExpect(status().isUnauthorized());
        }

        yanlisParolaIleGirisDene("lockout@dijitalik.local")
                .andExpect(status().isLocked())
                .andExpect(jsonPath("$.title").value("Hesap kilitli"))
                .andExpect(jsonPath("$.lockedUntil").exists());
    }

    @Test
    void kilitliHesapDogruParolaIleDeGirisYapamaz() throws Exception {
        userRepository.save(new User("lockout2@dijitalik.local", passwordEncoder.encode("Sifre123!")));

        for (int i = 0; i < 5; i++) {
            yanlisParolaIleGirisDene("lockout2@dijitalik.local");
        }

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new LoginRequest("lockout2@dijitalik.local", "Sifre123!"))))
                .andExpect(status().isLocked());
    }

    @Test
    void basariliGirisBasarisizDenemeSayaciniSifirlar() throws Exception {
        userRepository.save(new User("reset@dijitalik.local", passwordEncoder.encode("Sifre123!")));

        for (int i = 0; i < 2; i++) {
            yanlisParolaIleGirisDene("reset@dijitalik.local").andExpect(status().isUnauthorized());
        }

        // Başarılı giriş sayacı sıfırlamalı; aksi halde bir sonraki 3 başarısız
        // deneme (2 + 3 = 5) hesabı kilitlerdi.
        girisYapVeTokenAl("reset@dijitalik.local", "Sifre123!");

        for (int i = 0; i < 3; i++) {
            yanlisParolaIleGirisDene("reset@dijitalik.local").andExpect(status().isUnauthorized());
        }
    }

    /** US-02.2.4: Giriş yapan kullanıcı kendi ad, e-posta ve rol bilgilerini görebilir. */
    @Test
    void girisYapanKullaniciKendiProfilBilgileriniGorebilir() throws Exception {
        User user = userRepository.save(
                new User("profil@dijitalik.local", passwordEncoder.encode("Sifre123!"), "Test Kullanıcı"));
        Role role = roleRepository.save(new Role(Role.CALISAN));
        userRoleRepository.save(new UserRole(user.getId(), role.getId()));
        String token = girisYapVeTokenAl("profil@dijitalik.local", "Sifre123!");

        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(user.getId()))
                .andExpect(jsonPath("$.email").value("profil@dijitalik.local"))
                .andExpect(jsonPath("$.fullName").value("Test Kullanıcı"))
                .andExpect(jsonPath("$.roles[0]").value(Role.CALISAN));
    }

    /** US-02.2.3: Token olmadan korumalı ekrana (profil) erişilemez; 401 döner. */
    @Test
    void tokenOlmadanProfilGorulemezVe401Doner() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    /**
     * US-08D.1.4 kabul kriteri: "Bordro ekranına girişte ikinci faktör
     * istenir." Step-up doğrulanmadan {@code /api/payroll/**} 403 döner;
     * kod istenip doğru şekilde doğrulandıktan sonra PayrollStepUpFilter
     * isteği geçirir (bu izole test modülünde payroll controller'ı taranmadığı
     * için sonuç 404'tür — önemli olan artık 403 OLMAMASIdır).
     */
    @Test
    void stepUpDogrulanmadanBordroUcunaErisilemezVeDogrulandiktanSonraGecilir() throws Exception {
        userRepository.save(new User("bordro@dijitalik.local", passwordEncoder.encode("Sifre123!")));
        String token = girisYapVeTokenAl("bordro@dijitalik.local", "Sifre123!");

        mockMvc.perform(get("/api/payroll/items").header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.title").value("Ek doğrulama gerekli"));

        mockMvc.perform(post("/api/auth/payroll-access/request").header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        Session session = sessionRepository.findByToken(token).orElseThrow();
        String code = session.getStepUpCode();

        mockMvc.perform(post("/api/auth/payroll-access/verify")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new VerifyPayrollAccessRequest(code))))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/payroll/items").header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    @Test
    void yanlisDogrulamaKoduReddedilir() throws Exception {
        userRepository.save(new User("bordro2@dijitalik.local", passwordEncoder.encode("Sifre123!")));
        String token = girisYapVeTokenAl("bordro2@dijitalik.local", "Sifre123!");
        mockMvc.perform(post("/api/auth/payroll-access/request").header("Authorization", "Bearer " + token));

        mockMvc.perform(post("/api/auth/payroll-access/verify")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new VerifyPayrollAccessRequest("000000"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Doğrulama kodu hatalı."));
    }

    @Test
    void kodIstenmedenDogrulamaYapilamaz() throws Exception {
        userRepository.save(new User("bordro3@dijitalik.local", passwordEncoder.encode("Sifre123!")));
        String token = girisYapVeTokenAl("bordro3@dijitalik.local", "Sifre123!");

        mockMvc.perform(post("/api/auth/payroll-access/verify")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new VerifyPayrollAccessRequest("123456"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Önce bir doğrulama kodu istenmelidir."));
    }

    @Test
    void suresiDolmusDogrulamaKoduReddedilir() throws Exception {
        User user = userRepository.save(new User("bordro4@dijitalik.local", passwordEncoder.encode("Sifre123!")));
        String token = girisYapVeTokenAl("bordro4@dijitalik.local", "Sifre123!");
        Session session = sessionRepository.findByToken(token).orElseThrow();
        session.issueStepUpCode("123456", Instant.now().minusSeconds(60));
        sessionRepository.save(session);

        mockMvc.perform(post("/api/auth/payroll-access/verify")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new VerifyPayrollAccessRequest("123456"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Doğrulama kodunun süresi dolmuş."));
    }

    /** Kimliği doğrulanmamış bir istek, step-up 403'ü değil standart 401'i almaya devam eder. */
    @Test
    void tokenOlmadanBordroUcunaErisimStandart401Doner() throws Exception {
        mockMvc.perform(get("/api/payroll/items"))
                .andExpect(status().isUnauthorized());
    }

    /**
     * US-09.1.3 kabul kriteri: "TOTP kaydı yapılabilir; onaylı kod ile
     * bordro erişimi yükseltilebilir." Kayıt başlatılıp GÜNCEL bir kodla
     * ({@code DefaultCodeGenerator}, gerçek bir authenticator uygulamasının
     * ÜRETECEĞİ AYNI kod) onaylanır, sonra AYNI mekanizmayla ({@code
     * verify-totp}) — e-posta kodu HİÇ İSTENMEDEN — bordro erişimi
     * yükseltilir.
     */
    @Test
    void totpKaydiOnaylanirVeBordroErisimiYukseltir() throws Exception {
        userRepository.save(new User("totp1@dijitalik.local", passwordEncoder.encode("Sifre123!")));
        String token = girisYapVeTokenAl("totp1@dijitalik.local", "Sifre123!");

        MvcResult enrollResult = mockMvc.perform(post("/api/auth/mfa/enroll").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.secret").exists())
                .andExpect(jsonPath("$.otpAuthUri").value(Matchers.startsWith("otpauth://totp/")))
                .andReturn();
        String secret = objectMapper.readTree(enrollResult.getResponse().getContentAsString()).get("secret").asText();

        mockMvc.perform(post("/api/auth/mfa/enroll/confirm")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ConfirmMfaRequest(guncelTotpKodu(secret)))))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/payroll/items").header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/auth/payroll-access/verify-totp")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new VerifyPayrollAccessRequest(guncelTotpKodu(secret)))))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/payroll/items").header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    @Test
    void yanlisKodlaTotpKaydiOnaylanamaz() throws Exception {
        userRepository.save(new User("totp2@dijitalik.local", passwordEncoder.encode("Sifre123!")));
        String token = girisYapVeTokenAl("totp2@dijitalik.local", "Sifre123!");
        mockMvc.perform(post("/api/auth/mfa/enroll").header("Authorization", "Bearer " + token));

        mockMvc.perform(post("/api/auth/mfa/enroll/confirm")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ConfirmMfaRequest("000000"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Doğrulama kodu hatalı."));
    }

    @Test
    void kayitOnaylanmadanTotpIleBordroErisimiYukseltilemez() throws Exception {
        userRepository.save(new User("totp3@dijitalik.local", passwordEncoder.encode("Sifre123!")));
        String token = girisYapVeTokenAl("totp3@dijitalik.local", "Sifre123!");

        mockMvc.perform(post("/api/auth/payroll-access/verify-totp")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new VerifyPayrollAccessRequest("123456"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("TOTP etkin değil."));
    }

    private String guncelTotpKodu(String secret) throws Exception {
        CodeGenerator codeGenerator = new DefaultCodeGenerator();
        TimeProvider timeProvider = new SystemTimeProvider();
        return codeGenerator.generate(secret, Math.floorDiv(timeProvider.getTime(), 30));
    }

    private ResultActions yanlisParolaIleGirisDene(String email) throws Exception {
        return mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new LoginRequest(email, "YanlisParola"))));
    }

    private String girisYapVeTokenAl(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(email, password))))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }
}
