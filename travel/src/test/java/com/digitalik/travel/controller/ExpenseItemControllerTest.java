package com.digitalik.travel.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.travel.dto.CreateTravelRequestRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-08B.1.2 kabul kriteri: "Çalışan olarak, masraf kalemlerini belge ile
 * beyan etmek istiyorum. Her kalem tutar+belge ile kaydedilir."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ExpenseItemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void masrafKalemiTutarVeBelgeIleKaydedilir() throws Exception {
        Long travelRequestId = seyahatTalebiOlustur();
        MockMultipartFile document =
                new MockMultipartFile("document", "fatura.pdf", MediaType.APPLICATION_PDF_VALUE, "fatura-icerigi".getBytes());

        mockMvc.perform(multipart("/api/travel/requests/" + travelRequestId + "/expense-items")
                        .file(document)
                        .param("amount", "150.50"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.travelRequestId").value(travelRequestId))
                .andExpect(jsonPath("$.amount").value(150.50))
                .andExpect(jsonPath("$.documentFileName").value("fatura.pdf"))
                .andExpect(jsonPath("$.documentContentType").value(MediaType.APPLICATION_PDF_VALUE));
    }

    @Test
    void kaydedilenKalemGeriOkunur() throws Exception {
        Long travelRequestId = seyahatTalebiOlustur();
        MockMultipartFile document =
                new MockMultipartFile("document", "fis.jpg", MediaType.IMAGE_JPEG_VALUE, "fis-icerigi".getBytes());

        mockMvc.perform(multipart("/api/travel/requests/" + travelRequestId + "/expense-items")
                        .file(document)
                        .param("amount", "75.00"))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/travel/requests/" + travelRequestId + "/expense-items"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].documentFileName").value("fis.jpg"));
    }

    @Test
    void olmayanSeyahatTalebiIcinKalemEklenemezVe404Doner() throws Exception {
        MockMultipartFile document =
                new MockMultipartFile("document", "fatura.pdf", MediaType.APPLICATION_PDF_VALUE, "içerik".getBytes());

        mockMvc.perform(multipart("/api/travel/requests/999999/expense-items")
                        .file(document)
                        .param("amount", "100"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Seyahat talebi bulunamadı"));
    }

    @Test
    void belgesizKalemReddedilirVe400Doner() throws Exception {
        Long travelRequestId = seyahatTalebiOlustur();

        mockMvc.perform(multipart("/api/travel/requests/" + travelRequestId + "/expense-items")
                        .param("amount", "100"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Belge boş olamaz."));
    }

    @Test
    void sifirVeyaNegatifTutarReddedilirVe400Doner() throws Exception {
        Long travelRequestId = seyahatTalebiOlustur();
        MockMultipartFile document =
                new MockMultipartFile("document", "fatura.pdf", MediaType.APPLICATION_PDF_VALUE, "içerik".getBytes());

        mockMvc.perform(multipart("/api/travel/requests/" + travelRequestId + "/expense-items")
                        .file(document)
                        .param("amount", "0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Tutar sıfırdan büyük olmalıdır."));
    }

    @Test
    void olmayanSeyahatTalebiIcinListelenemezVe404Doner() throws Exception {
        mockMvc.perform(get("/api/travel/requests/999999/expense-items"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Seyahat talebi bulunamadı"));
    }

    private Long seyahatTalebiOlustur() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/travel/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateTravelRequestRequest(
                                40L, "İstanbul", LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 5), "Müşteri ziyareti"))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }
}
