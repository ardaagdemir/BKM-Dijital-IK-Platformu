package com.digitalik.leave.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.leave.dto.LeaveTypeRequest;
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
 * US-04.1.1 kabul kriteri: "Tür adı/kodu ile basit bir tanım listesi
 * oluşturulur."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class LeaveTypeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void izinTuruOlusturulabilir() throws Exception {
        mockMvc.perform(post("/api/leave/types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LeaveTypeRequest("Yıllık İzin", "YILLIK"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Yıllık İzin"))
                .andExpect(jsonPath("$.code").value("YILLIK"));
    }

    @Test
    void tumIzinTurleriListelenir() throws Exception {
        izinTuruOlustur("Yıllık İzin", "YILLIK");
        izinTuruOlustur("Mazeret İzni", "MAZERET");

        mockMvc.perform(get("/api/leave/types"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void izinTuruGuncellenebilir() throws Exception {
        Long id = izinTuruOlustur("Yıllık İzin", "YILLIK");

        mockMvc.perform(put("/api/leave/types/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LeaveTypeRequest("Yıllık Ücretli İzin", "YILLIK"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.name").value("Yıllık Ücretli İzin"));
    }

    @Test
    void olmayanIzinTuruGuncellenemezVe404Doner() throws Exception {
        mockMvc.perform(put("/api/leave/types/999999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LeaveTypeRequest("Hayalet Tür", "HAYALET"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("İzin türü bulunamadı"));
    }

    @Test
    void izinTuruSilinebilir() throws Exception {
        Long id = izinTuruOlustur("Silinecek Tür", "SILINECEK");

        mockMvc.perform(delete("/api/leave/types/" + id)).andExpect(status().isNoContent());

        mockMvc.perform(get("/api/leave/types")).andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void olmayanIzinTuruSilinemezVe404Doner() throws Exception {
        mockMvc.perform(delete("/api/leave/types/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("İzin türü bulunamadı"));
    }

    @Test
    void bosIsimliIzinTuruOlusturulamazVe400Doner() throws Exception {
        mockMvc.perform(post("/api/leave/types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LeaveTypeRequest("  ", "YILLIK"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Geçersiz istek"));
    }

    @Test
    void bosKodluIzinTuruOlusturulamazVe400Doner() throws Exception {
        mockMvc.perform(post("/api/leave/types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LeaveTypeRequest("Yıllık İzin", "  "))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void ayniKodlaIkinciIzinTuruOlusturulamazVe409Doner() throws Exception {
        izinTuruOlustur("Yıllık İzin", "YILLIK");

        mockMvc.perform(post("/api/leave/types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LeaveTypeRequest("Yıllık İzin (2)", "YILLIK"))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.title").value("İzin türü zaten kayıtlı"));
    }

    @Test
    void degismeyenKodIleGuncellemeCakismaSayilmaz() throws Exception {
        Long id = izinTuruOlustur("Yıllık İzin", "YILLIK");

        mockMvc.perform(put("/api/leave/types/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LeaveTypeRequest("Yıllık İzin", "YILLIK"))))
                .andExpect(status().isOk());
    }

    @Test
    void baskaTurunKoduIleGuncellenemezVe409Doner() throws Exception {
        izinTuruOlustur("Yıllık İzin", "YILLIK");
        Long id2 = izinTuruOlustur("Mazeret İzni", "MAZERET");

        mockMvc.perform(put("/api/leave/types/" + id2)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LeaveTypeRequest("Mazeret İzni", "YILLIK"))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.title").value("İzin türü zaten kayıtlı"));
    }

    private Long izinTuruOlustur(String name, String code) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/leave/types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LeaveTypeRequest(name, code))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }
}
