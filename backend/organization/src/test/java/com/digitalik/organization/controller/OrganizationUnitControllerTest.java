package com.digitalik.organization.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.organization.dto.CreateOrganizationUnitRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-03.1.1 kabul kriteri: "Birim ağaç yapıda tanımlanır; bir birim başka bir
 * birimin altına eklenebilir."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class OrganizationUnitControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void kokBirimOlusturulabilir() throws Exception {
        mockMvc.perform(post("/api/organization/units")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateOrganizationUnitRequest("ABC Şirketi", null))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("ABC Şirketi"))
                .andExpect(jsonPath("$.parentId").doesNotExist());
    }

    @Test
    void birimBaskaBirBirininAltinaEklenebilir() throws Exception {
        Long companyId = birimOlustur("ABC Şirketi", null);

        mockMvc.perform(post("/api/organization/units")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateOrganizationUnitRequest("İstanbul İşyeri", companyId))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("İstanbul İşyeri"))
                .andExpect(jsonPath("$.parentId").value(companyId));

        mockMvc.perform(get("/api/organization/units"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[?(@.name=='İstanbul İşyeri')].parentId").value(companyId.intValue()));
    }

    @Test
    void olmayanUstBirimeAltBirimEklenemezVe404Doner() throws Exception {
        mockMvc.perform(post("/api/organization/units")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateOrganizationUnitRequest("Hayalet Bölüm", 999999L))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Birim bulunamadı"));
    }

    @Test
    void bosIsimliBirimOlusturulamazVe400Doner() throws Exception {
        mockMvc.perform(post("/api/organization/units")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateOrganizationUnitRequest("  ", null))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Geçersiz istek"));
    }

    private Long birimOlustur(String name, Long parentId) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/organization/units")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateOrganizationUnitRequest(name, parentId))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }
}
