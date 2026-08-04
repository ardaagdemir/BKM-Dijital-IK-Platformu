package com.digitalik.platform.customfield;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.platform.customfield.dto.CreateCustomFieldDefinitionRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-09.5.1 kabul kriteri: "Sistem yöneticisi olarak, kod değişikliği
 * olmadan yeni bir alan tanımlamak istiyorum." Rol kısıtlaması ({@code
 * @PreAuthorize}) bu izole test bağlamında görünmüyor (bkz. {@code
 * ApprovalChainDefinitionControllerTest}'teki AYNI gerekçe) — Docker'da
 * ayrıca doğrulanıyor.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CustomFieldDefinitionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void yeniAlanTanimlanirVeDoner() throws Exception {
        mockMvc.perform(post("/api/platform/custom-fields")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateCustomFieldDefinitionRequest(
                                "TestEntity", "seviye", CustomFieldType.SELECT, "A1,A2,B1", true))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.fieldName").value("seviye"))
                .andExpect(jsonPath("$.fieldType").value("SELECT"))
                .andExpect(jsonPath("$.selectOptions").value("A1,A2,B1"))
                .andExpect(jsonPath("$.required").value(true));
    }

    @Test
    void secimTipiIcinSecenekYoksaReddedilir() throws Exception {
        mockMvc.perform(post("/api/platform/custom-fields")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateCustomFieldDefinitionRequest("TestEntity", "seviye", CustomFieldType.SELECT, null, false))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Seçim tipi için en az bir seçenek gereklidir."));
    }

    @Test
    void varlikTipineGoreListelenir() throws Exception {
        mockMvc.perform(post("/api/platform/custom-fields")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateCustomFieldDefinitionRequest("ListelenecekTip", "alan1", CustomFieldType.TEXT, null, false))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/platform/custom-fields").param("entityType", "ListelenecekTip"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].fieldName").value("alan1"));
    }

    @Test
    void ayniVarlikTipindeAyniAdlaIkinciAlanTanimlanamaz() throws Exception {
        mockMvc.perform(post("/api/platform/custom-fields")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateCustomFieldDefinitionRequest("TekrarliTip", "alan1", CustomFieldType.TEXT, null, false))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/platform/custom-fields")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateCustomFieldDefinitionRequest("TekrarliTip", "alan1", CustomFieldType.NUMBER, null, false))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Bu varlık tipi için bu adla bir alan zaten tanımlı."));
    }
}
