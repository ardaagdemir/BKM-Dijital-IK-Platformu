package com.digitalik.discipline.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.discipline.dto.CreateDisciplinaryCaseRequest;
import com.digitalik.discipline.dto.RecordDefenseRequest;
import com.digitalik.discipline.entity.DisciplinaryCase;
import com.digitalik.discipline.entity.DisciplinaryCaseStatus;
import com.digitalik.discipline.repository.DisciplinaryCaseRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-08C.1.2 kabul kriteri: "İK kullanıcısı olarak, ceza sürecini
 * kaydetmek istiyorum; çalışan savunması alınmadan süreç kapanmamalı.
 * Savunma alanı boşken süreç tamamlanamaz."
 *
 * <p>US-08C.1.3 kabul kriteri (SEC-021): "Var olan kayıt güncellenemez;
 * yeni revizyon eklenir." — bkz. {@code
 * kayitlarGuncellenmezYeniRevizyonEklenir}.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class DisciplinaryCaseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DisciplinaryCaseRepository disciplinaryCaseRepository;

    private Long createCase(Long employeeId, String reason) throws Exception {
        String body = mockMvc.perform(post("/api/discipline/cases")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateDisciplinaryCaseRequest(employeeId, reason))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(body).get("id").asLong();
    }

    @Test
    void cezaSureciCalisanaBaglanirVeOpenDurumundaAcilir() throws Exception {
        mockMvc.perform(post("/api/discipline/cases")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreateDisciplinaryCaseRequest(80L, "İş güvenliği ihlali"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.employeeId").value(80))
                .andExpect(jsonPath("$.reason").value("İş güvenliği ihlali"))
                .andExpect(jsonPath("$.defense").doesNotExist())
                .andExpect(jsonPath("$.status").value("OPEN"));
    }

    @Test
    void savunmaAlinmadanSurecKapatilamazVe400Doner() throws Exception {
        Long id = createCase(81L, "Devamsızlık");

        mockMvc.perform(put("/api/discipline/cases/{id}/close", id))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Savunma alınmadan ceza süreci tamamlanamaz."));
    }

    @Test
    void savunmaKaydedildiktenSonraSurecKapatilabilir() throws Exception {
        Long id = createCase(82L, "Şirket kaynaklarının kötüye kullanımı");

        mockMvc.perform(put("/api/discipline/cases/{id}/defense", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RecordDefenseRequest("Olayı reddediyorum."))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.defense").value("Olayı reddediyorum."))
                .andExpect(jsonPath("$.status").value("OPEN"));

        mockMvc.perform(put("/api/discipline/cases/{id}/close", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CLOSED"));
    }

    @Test
    void bosSavunmaReddedilirVe400Doner() throws Exception {
        Long id = createCase(83L, "Sebep");

        mockMvc.perform(put("/api/discipline/cases/{id}/defense", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RecordDefenseRequest("  "))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Savunma boş olamaz."));
    }

    @Test
    void kapatilmisSurecTekrarKapatilamazVe400Doner() throws Exception {
        Long id = createCase(84L, "Sebep");
        mockMvc.perform(put("/api/discipline/cases/{id}/defense", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RecordDefenseRequest("Savunmam budur."))));
        mockMvc.perform(put("/api/discipline/cases/{id}/close", id)).andExpect(status().isOk());

        mockMvc.perform(put("/api/discipline/cases/{id}/close", id))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Bu süreç zaten kapatılmış."));
    }

    @Test
    void olmayanBirSureceSavunmaEklenmesiReddedilirVe404Doner() throws Exception {
        mockMvc.perform(put("/api/discipline/cases/{id}/defense", 999999L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RecordDefenseRequest("Savunma"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Ceza süreci bulunamadı."));
    }

    @Test
    void bosGerekceReddedilirVe400Doner() throws Exception {
        mockMvc.perform(post("/api/discipline/cases")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateDisciplinaryCaseRequest(85L, "  "))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Gerekçe boş olamaz."));
    }

    @Test
    void employeeIdOlmadanListelemeReddedilirVe400Doner() throws Exception {
        mockMvc.perform(get("/api/discipline/cases"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Çalışan boş olamaz."));
    }

    @Test
    void kaydedilenCezaSureciGeriOkunur() throws Exception {
        createCase(86L, "Sebep");

        mockMvc.perform(get("/api/discipline/cases").param("employeeId", "86"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].reason").value("Sebep"));
    }

    /**
     * US-08C.1.3 kabul kriteri: "Var olan kayıt güncellenemez; yeni
     * revizyon eklenir." Yalnızca API yanıtlarını değil, doğrudan
     * repository'yi kontrol ederek her adımın YENİ bir satır eklediğini
     * (UPDATE değil INSERT) ve kök (ilk) satırın hiçbir zaman
     * değişmediğini kanıtlar.
     */
    @Test
    void kayitlarGuncellenmezYeniRevizyonEklenir() throws Exception {
        long baseline = disciplinaryCaseRepository.count();
        Long id = createCase(87L, "İş güvenliği ihlali");
        long afterCreate = disciplinaryCaseRepository.count();

        mockMvc.perform(put("/api/discipline/cases/{id}/defense", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RecordDefenseRequest("Olayı reddediyorum."))))
                .andExpect(status().isOk());
        long afterDefense = disciplinaryCaseRepository.count();

        mockMvc.perform(put("/api/discipline/cases/{id}/close", id)).andExpect(status().isOk());
        long afterClose = disciplinaryCaseRepository.count();

        assertThat(afterCreate - baseline).isEqualTo(1);
        assertThat(afterDefense - afterCreate).isEqualTo(1);
        assertThat(afterClose - afterDefense).isEqualTo(1);

        DisciplinaryCase rootRow = disciplinaryCaseRepository.findById(id).orElseThrow();
        assertThat(rootRow.getStatus()).isEqualTo(DisciplinaryCaseStatus.OPEN);
        assertThat(rootRow.getDefense()).isNull();
        assertThat(rootRow.getCaseId()).isNull();
    }
}
