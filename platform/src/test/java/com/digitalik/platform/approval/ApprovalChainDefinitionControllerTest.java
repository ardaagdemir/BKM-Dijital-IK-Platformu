package com.digitalik.platform.approval;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.platform.approval.dto.CreateApprovalChainRequest;
import com.digitalik.platform.approval.dto.UpdateApprovalChainStepsRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-09.2.2 kabul kriteri: "Zincir adım sayısı/onaylayıcı rolü ekrandan
 * yapılandırılır." Bu izole test bağlamında gerçek {@code @PreAuthorize}
 * uygulaması görünmüyor (bkz. {@code organization.EmployeeControllerTest}'teki
 * aynı gerekçe — {@code @EnableMethodSecurity} yalnızca {@code auth}'un
 * paylaşılan Spring context'inde etkin); bu testler yalnızca CRUD
 * mantığını doğrular, rol kısıtlaması Docker'da ayrıca doğrulanıyor.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ApprovalChainDefinitionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void yeniZincirAdimSayisiVeRolleriyleTanimlanir() throws Exception {
        mockMvc.perform(post("/api/platform/approval-chains")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateApprovalChainRequest("test-zinciri", List.of("YONETICI", "IK", "ADMIN")))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("test-zinciri"))
                .andExpect(jsonPath("$.steps.length()").value(3))
                .andExpect(jsonPath("$.steps[0].stepOrder").value(1))
                .andExpect(jsonPath("$.steps[0].requiredRole").value("YONETICI"))
                .andExpect(jsonPath("$.steps[2].requiredRole").value("ADMIN"));
    }

    @Test
    void olusturulanZincirListedeGorunur() throws Exception {
        mockMvc.perform(post("/api/platform/approval-chains")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateApprovalChainRequest("listelenecek-zincir", List.of("YONETICI")))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/platform/approval-chains"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("listelenecek-zincir"));
    }

    @Test
    void adimlarGuncellenebilir() throws Exception {
        String body = mockMvc.perform(post("/api/platform/approval-chains")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateApprovalChainRequest("guncellenecek-zincir", List.of("YONETICI")))))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long id = objectMapper.readTree(body).get("id").asLong();

        mockMvc.perform(put("/api/platform/approval-chains/" + id + "/steps")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new UpdateApprovalChainStepsRequest(List.of("IK", "ADMIN")))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.steps.length()").value(2))
                .andExpect(jsonPath("$.steps[0].requiredRole").value("IK"))
                .andExpect(jsonPath("$.steps[1].requiredRole").value("ADMIN"));
    }

    @Test
    void ayniAdlaIkinciZincirOlusturulamazVe400Doner() throws Exception {
        mockMvc.perform(post("/api/platform/approval-chains")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateApprovalChainRequest("tekrarli-zincir", List.of("YONETICI")))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/platform/approval-chains")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateApprovalChainRequest("tekrarli-zincir", List.of("IK")))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Bu adla bir onay zinciri zaten var."));
    }

    @Test
    void olmayanZincirinAdimlariGuncellenemezVe404Doner() throws Exception {
        mockMvc.perform(put("/api/platform/approval-chains/999999/steps")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateApprovalChainStepsRequest(List.of("IK")))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Onay zinciri tanımı bulunamadı"));
    }
}
