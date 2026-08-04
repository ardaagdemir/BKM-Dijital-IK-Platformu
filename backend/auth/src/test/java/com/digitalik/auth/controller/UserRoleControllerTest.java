package com.digitalik.auth.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.auth.dto.AssignRoleRequest;
import com.digitalik.auth.dto.LoginRequest;
import com.digitalik.auth.entity.Role;
import com.digitalik.auth.entity.User;
import com.digitalik.auth.entity.UserRole;
import com.digitalik.auth.repository.RoleRepository;
import com.digitalik.auth.repository.UserRepository;
import com.digitalik.auth.repository.UserRoleRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-02.2.2 kabul kriteri: "Kullanıcıya rol atanır/kaldırılır; değişiklik bir
 * sonraki istekte etkilidir."
 *
 * <p>US-02.2.3'ten itibaren atama/kaldırma uçları yalnızca {@link Role#ADMIN}
 * rolüne sahip, kimlik doğrulanmış kullanıcılara açıktır; bu yüzden ilgili
 * testler artık her istekte geçerli bir ADMIN token'ı gönderir.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class UserRoleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void rolAtanirVeListelenir() throws Exception {
        User user = userRepository.save(new User("roluser@dijitalik.local", passwordEncoder.encode("Sifre123!")));
        roleRepository.save(new Role(Role.YONETICI));
        String adminToken = adminTokenIleGirisYap();

        mockMvc.perform(post("/api/auth/users/" + user.getId() + "/roles")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AssignRoleRequest(Role.YONETICI))))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/auth/users/" + user.getId() + "/roles")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].code").value(Role.YONETICI));
    }

    @Test
    void ayniRolTekrarAtanirsaCogaltilmaz() throws Exception {
        User user = userRepository.save(new User("dup@dijitalik.local", passwordEncoder.encode("Sifre123!")));
        roleRepository.save(new Role(Role.CALISAN));
        String adminToken = adminTokenIleGirisYap();

        for (int i = 0; i < 2; i++) {
            mockMvc.perform(post("/api/auth/users/" + user.getId() + "/roles")
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(new AssignRoleRequest(Role.CALISAN))))
                    .andExpect(status().isNoContent());
        }

        mockMvc.perform(get("/api/auth/users/" + user.getId() + "/roles")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void rolKaldirilirVeListedenCikar() throws Exception {
        User user = userRepository.save(new User("remove@dijitalik.local", passwordEncoder.encode("Sifre123!")));
        roleRepository.save(new Role(Role.IK));
        String adminToken = adminTokenIleGirisYap();

        mockMvc.perform(post("/api/auth/users/" + user.getId() + "/roles")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AssignRoleRequest(Role.IK))))
                .andExpect(status().isNoContent());

        mockMvc.perform(delete("/api/auth/users/" + user.getId() + "/roles/" + Role.IK)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/auth/users/" + user.getId() + "/roles")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void olmayanRolAtanamazVe404Doner() throws Exception {
        User user = userRepository.save(new User("norole@dijitalik.local", passwordEncoder.encode("Sifre123!")));
        String adminToken = adminTokenIleGirisYap();

        mockMvc.perform(post("/api/auth/users/" + user.getId() + "/roles")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AssignRoleRequest("OLMAYAN_ROL"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Rol bulunamadı"));
    }

    @Test
    void olmayanKullaniciyaRolAtanamazVe404Doner() throws Exception {
        roleRepository.save(new Role(Role.ADMIN));
        String adminToken = adminTokenIleGirisYap();

        mockMvc.perform(post("/api/auth/users/999999/roles")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AssignRoleRequest(Role.ADMIN))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Kullanıcı bulunamadı"));
    }

    @Test
    void atanmamisRolKaldirilmayaCalisilirsaNoOpOlur() throws Exception {
        User user = userRepository.save(new User("noop@dijitalik.local", passwordEncoder.encode("Sifre123!")));
        roleRepository.save(new Role(Role.YONETICI));
        String adminToken = adminTokenIleGirisYap();

        mockMvc.perform(delete("/api/auth/users/" + user.getId() + "/roles/" + Role.YONETICI)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());
    }

    /** US-02.2.3: Token olmadan rol atama isteği 401 ile reddedilir. */
    @Test
    void tokenOlmadanRolAtanamazVe401Doner() throws Exception {
        User user = userRepository.save(new User("notoken@dijitalik.local", passwordEncoder.encode("Sifre123!")));
        roleRepository.save(new Role(Role.CALISAN));

        mockMvc.perform(post("/api/auth/users/" + user.getId() + "/roles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AssignRoleRequest(Role.CALISAN))))
                .andExpect(status().isUnauthorized());
    }

    /** US-02.2.3: ADMIN olmayan, kimliği doğrulanmış bir kullanıcı rol atayamaz; 403 döner. */
    @Test
    void adminOlmayanKullaniciRolAtayamazVe403Doner() throws Exception {
        User target = userRepository.save(new User("target@dijitalik.local", passwordEncoder.encode("Sifre123!")));
        roleRepository.save(new Role(Role.CALISAN));

        User nonAdmin = userRepository.save(new User("nonadmin@dijitalik.local", passwordEncoder.encode("Sifre123!")));
        String nonAdminToken = girisYapVeTokenAl(nonAdmin.getEmail(), "Sifre123!");

        mockMvc.perform(post("/api/auth/users/" + target.getId() + "/roles")
                        .header("Authorization", "Bearer " + nonAdminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AssignRoleRequest(Role.CALISAN))))
                .andExpect(status().isForbidden());
    }

    private String adminTokenIleGirisYap() throws Exception {
        User admin = userRepository.save(
                new User("admin-" + System.nanoTime() + "@dijitalik.local", passwordEncoder.encode("Sifre123!")));
        Role adminRole = roleRepository.findByCode(Role.ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(Role.ADMIN)));
        userRoleRepository.save(new UserRole(admin.getId(), adminRole.getId()));
        return girisYapVeTokenAl(admin.getEmail(), "Sifre123!");
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
