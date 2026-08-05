package com.digitalik.auth.controller;

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
 * Bölüm 14.1 (frontend roadmap ön-koşulu): {@code GET /api/auth/users} —
 * `/admin/users/:id/roles` sayfasının kullanıcı SEÇEBİLMESİ için dizin ucu.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class UserControllerTest {

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
    void kullanicilarRolleriyleBirlikteListelenir() throws Exception {
        User user = userRepository.save(
                new User("listelenen@dijitalik.local", passwordEncoder.encode("Sifre123!"), "Listelenen Kullanıcı"));
        roleRepository.save(new Role(Role.CALISAN));
        String adminToken = adminTokenIleGirisYap();

        mockMvc.perform(post("/api/auth/users/" + user.getId() + "/roles")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AssignRoleRequest(Role.CALISAN))))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/auth/users").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + user.getId() + ")].email").value("listelenen@dijitalik.local"))
                .andExpect(jsonPath("$[?(@.id == " + user.getId() + ")].fullName").value("Listelenen Kullanıcı"))
                .andExpect(jsonPath("$[?(@.id == " + user.getId() + ")].roles[0]").value(Role.CALISAN));
    }

    /** US-02.2.3'teki AYNI kural: rol yönetimiyle ilgili tüm uçlar ADMIN-only. */
    @Test
    void tokenOlmadanListelenemezVe401Doner() throws Exception {
        mockMvc.perform(get("/api/auth/users")).andExpect(status().isUnauthorized());
    }

    @Test
    void adminOlmayanKullaniciListeleyemezVe403Doner() throws Exception {
        User nonAdmin = userRepository.save(new User("nonadmin2@dijitalik.local", passwordEncoder.encode("Sifre123!")));
        String nonAdminToken = girisYapVeTokenAl(nonAdmin.getEmail(), "Sifre123!");

        mockMvc.perform(get("/api/auth/users").header("Authorization", "Bearer " + nonAdminToken))
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
