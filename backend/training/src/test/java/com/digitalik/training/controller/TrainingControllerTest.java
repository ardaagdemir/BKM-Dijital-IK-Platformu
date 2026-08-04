package com.digitalik.training.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.training.dto.TrainingRequest;
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
 * US-08A.1.1 kabul kriteri: "İK kullanıcısı olarak, katalogda eğitim
 * tanımlamak istiyorum (ad, tür, süre, sağlayıcı). Katalog CRUD ekranından
 * yönetilir."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class TrainingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void egitimOlusturulabilir() throws Exception {
        mockMvc.perform(post("/api/training/trainings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new TrainingRequest("İş Güvenliği Eğitimi", "Zorunlu", 8, "ABC Danışmanlık"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("İş Güvenliği Eğitimi"))
                .andExpect(jsonPath("$.type").value("Zorunlu"))
                .andExpect(jsonPath("$.durationHours").value(8))
                .andExpect(jsonPath("$.provider").value("ABC Danışmanlık"));
    }

    @Test
    void tumEgitimlerListelenir() throws Exception {
        egitimOlustur("İş Güvenliği Eğitimi");
        egitimOlustur("Liderlik Eğitimi");

        mockMvc.perform(get("/api/training/trainings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void egitimGuncellenebilir() throws Exception {
        Long id = egitimOlustur("İş Güvenliği Eğitimi");

        mockMvc.perform(put("/api/training/trainings/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new TrainingRequest("İleri İş Güvenliği Eğitimi", "Zorunlu", 16, "XYZ Danışmanlık"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.name").value("İleri İş Güvenliği Eğitimi"))
                .andExpect(jsonPath("$.durationHours").value(16));

        mockMvc.perform(get("/api/training/trainings"))
                .andExpect(jsonPath("$[0].name").value("İleri İş Güvenliği Eğitimi"));
    }

    @Test
    void olmayanEgitimGuncellenemezVe404Doner() throws Exception {
        mockMvc.perform(put("/api/training/trainings/999999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new TrainingRequest("Hayalet Eğitim", "Zorunlu", 8, "ABC"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Eğitim bulunamadı"));
    }

    @Test
    void egitimSilinebilir() throws Exception {
        Long id = egitimOlustur("Silinecek Eğitim");

        mockMvc.perform(delete("/api/training/trainings/" + id)).andExpect(status().isNoContent());

        mockMvc.perform(get("/api/training/trainings")).andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void olmayanEgitimSilinemezVe404Doner() throws Exception {
        mockMvc.perform(delete("/api/training/trainings/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Eğitim bulunamadı"));
    }

    @Test
    void bosIsimliEgitimOlusturulamazVe400Doner() throws Exception {
        mockMvc.perform(post("/api/training/trainings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new TrainingRequest("  ", "Zorunlu", 8, "ABC"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Eğitim adı boş olamaz."));
    }

    @Test
    void sifirVeyaNegatifSureReddedilirVe400Doner() throws Exception {
        mockMvc.perform(post("/api/training/trainings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new TrainingRequest("İş Güvenliği Eğitimi", "Zorunlu", 0, "ABC"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Süre (saat) sıfırdan büyük olmalıdır."));
    }

    private Long egitimOlustur(String name) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/training/trainings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new TrainingRequest(name, "Zorunlu", 8, "ABC Danışmanlık"))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }
}
