package com.digitalik.attendance.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.attendance.dto.WorkModelRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-07.1.1 kabul kriteri: "İK kullanıcısı olarak, temel çalışma modellerini
 * (tam zamanlı, vardiyalı) tanımlamak istiyorum. Model, çalışana atanabilir
 * bir referans kayıttır."
 *
 * <p>{@code plannedStartTime}/{@code plannedEndTime} alanları US-07.2.2'de
 * eklendi (bkz. {@code WorkModel} javadoc'u).
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class WorkModelControllerTest {

    private static final LocalTime START = LocalTime.of(9, 0);
    private static final LocalTime END = LocalTime.of(18, 0);

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void calismaModeliOlusturulabilir() throws Exception {
        mockMvc.perform(post("/api/attendance/work-models")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new WorkModelRequest("Tam Zamanlı", START, END))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Tam Zamanlı"))
                .andExpect(jsonPath("$.plannedStartTime").value("09:00:00"))
                .andExpect(jsonPath("$.plannedEndTime").value("18:00:00"));
    }

    @Test
    void tumCalismaModelleriListelenir() throws Exception {
        modelOlustur("Tam Zamanlı");
        modelOlustur("Vardiyalı");

        mockMvc.perform(get("/api/attendance/work-models"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void calismaModeliGuncellenebilir() throws Exception {
        Long id = modelOlustur("Tam Zamanlı");

        mockMvc.perform(put("/api/attendance/work-models/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new WorkModelRequest(
                                "Esnek Tam Zamanlı", LocalTime.of(10, 0), LocalTime.of(19, 0)))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.name").value("Esnek Tam Zamanlı"))
                .andExpect(jsonPath("$.plannedStartTime").value("10:00:00"));

        mockMvc.perform(get("/api/attendance/work-models"))
                .andExpect(jsonPath("$[0].name").value("Esnek Tam Zamanlı"));
    }

    @Test
    void olmayanModelGuncellenemezVe404Doner() throws Exception {
        mockMvc.perform(put("/api/attendance/work-models/999999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new WorkModelRequest("Hayalet Model", START, END))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Çalışma modeli bulunamadı"));
    }

    @Test
    void calismaModeliSilinebilir() throws Exception {
        Long id = modelOlustur("Silinecek Model");

        mockMvc.perform(delete("/api/attendance/work-models/" + id)).andExpect(status().isNoContent());

        mockMvc.perform(get("/api/attendance/work-models")).andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void olmayanModelSilinemezVe404Doner() throws Exception {
        mockMvc.perform(delete("/api/attendance/work-models/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Çalışma modeli bulunamadı"));
    }

    @Test
    void bosIsimliModelOlusturulamazVe400Doner() throws Exception {
        mockMvc.perform(post("/api/attendance/work-models")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new WorkModelRequest("  ", START, END))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Çalışma modeli adı boş olamaz."));
    }

    /** US-07.2.2 dolaylı gereği: planlanan bitiş, başlangıçtan sonra olmalıdır. */
    @Test
    void bitisBaslangictanOnceOlamazVe400Doner() throws Exception {
        mockMvc.perform(post("/api/attendance/work-models")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new WorkModelRequest("Geçersiz Model", LocalTime.of(18, 0), LocalTime.of(9, 0)))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Planlanan bitiş saati, başlangıç saatinden sonra olmalıdır."));
    }

    private Long modelOlustur(String name) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/attendance/work-models")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new WorkModelRequest(name, START, END))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }
}
