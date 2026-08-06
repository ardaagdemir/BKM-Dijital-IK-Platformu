package com.digitalik.organization.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.platform.file.VirusScanService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-08I.1.1 kabul kriteri: "İK kullanıcısı olarak, bir politika
 * dokümanı yükleyip versiyonlamak istiyorum. Yeni versiyon eskisini
 * arşivler."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PolicyDocumentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private VirusScanService virusScanService;

    /** US-09.7.2 kabul kriteri: "Tarama servisi entegre edilir." */
    @Test
    void enfekteDosyaReddedilirVe422Doner() throws Exception {
        when(virusScanService.isInfected(any())).thenReturn(true);
        MockMultipartFile file = new MockMultipartFile("file", "eicar.txt", "text/plain", "enfekte-icerik".getBytes());

        mockMvc.perform(multipart("/api/documents").file(file).param("title", "Enfekte Doküman"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.title").value("Dosya reddedildi"))
                .andExpect(jsonPath("$.detail").value("Dosyada virüs/kötü amaçlı içerik tespit edildi."));
    }

    private JsonNode uploadV1(String title) throws Exception {
        MockMultipartFile file =
                new MockMultipartFile("file", "izin-politikasi.pdf", "application/pdf", "v1 içerik".getBytes());
        String body = mockMvc.perform(multipart("/api/documents").file(file).param("title", title))
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(body);
    }

    @Test
    void ilkVersiyonYuklenir() throws Exception {
        MockMultipartFile file =
                new MockMultipartFile("file", "izin-politikasi.pdf", "application/pdf", "v1 içerik".getBytes());

        mockMvc.perform(multipart("/api/documents").file(file).param("title", "İzin Politikası"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title").value("İzin Politikası"))
                .andExpect(jsonPath("$.version").value(1))
                .andExpect(jsonPath("$.fileName").value("izin-politikasi.pdf"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.previousVersionId").doesNotExist());
    }

    @Test
    void yeniVersiyonEskisiniArsivler() throws Exception {
        JsonNode v1 = uploadV1("Seyahat Politikası");
        long v1Id = v1.get("id").asLong();

        MockMultipartFile v2File =
                new MockMultipartFile("file", "seyahat-politikasi-v2.pdf", "application/pdf", "v2 içerik".getBytes());
        mockMvc.perform(multipart("/api/documents").file(v2File).param("previousVersionId", String.valueOf(v1Id)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Seyahat Politikası"))
                .andExpect(jsonPath("$.version").value(2))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.previousVersionId").value(v1Id));

        String listBody = mockMvc.perform(get("/api/documents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode list = objectMapper.readTree(listBody);
        String v1Status = null;
        for (JsonNode entry : list) {
            if (entry.get("id").asLong() == v1Id) {
                v1Status = entry.get("status").asText();
            }
        }
        org.junit.jupiter.api.Assertions.assertEquals("ARCHIVED", v1Status);
    }

    @Test
    void arsivlenmisVersiyonUzerindenYeniVersiyonYuklenemezVe400Doner() throws Exception {
        JsonNode v1 = uploadV1("Uzaktan Çalışma Politikası");
        long v1Id = v1.get("id").asLong();
        MockMultipartFile v2File =
                new MockMultipartFile("file", "v2.pdf", "application/pdf", "v2 içerik".getBytes());
        mockMvc.perform(multipart("/api/documents").file(v2File).param("previousVersionId", String.valueOf(v1Id)))
                .andExpect(status().isCreated());

        // v1 artık ARCHIVED — üzerinden tekrar versiyon yüklemeye çalışmak reddedilmeli.
        MockMultipartFile v3File =
                new MockMultipartFile("file", "v3.pdf", "application/pdf", "v3 içerik".getBytes());
        mockMvc.perform(multipart("/api/documents").file(v3File).param("previousVersionId", String.valueOf(v1Id)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Yalnızca güncel (aktif) bir versiyon üzerinden yeni versiyon yüklenebilir."));
    }

    @Test
    void basliksizIlkVersiyonReddedilirVe400Doner() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "x.pdf", "application/pdf", "içerik".getBytes());

        mockMvc.perform(multipart("/api/documents").file(file))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Başlık boş olamaz."));
    }

    @Test
    void dosyasizYuklemeReddedilirVe400Doner() throws Exception {
        mockMvc.perform(multipart("/api/documents").param("title", "Doküman"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Doküman dosyası boş olamaz."));
    }

    @Test
    void olmayanOncekiVersiyonlaYuklenemezVe404Doner() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "x.pdf", "application/pdf", "içerik".getBytes());

        mockMvc.perform(multipart("/api/documents").file(file).param("previousVersionId", "999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Doküman bulunamadı."));
    }

    @Test
    void belgeIndirilir() throws Exception {
        JsonNode v1 = uploadV1("İzin Politikası");
        long v1Id = v1.get("id").asLong();

        mockMvc.perform(get("/api/documents/" + v1Id + "/document"))
                .andExpect(status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header()
                        .string("Content-Disposition", "attachment; filename=\"izin-politikasi.pdf\""))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.content()
                        .bytes("v1 içerik".getBytes()));
    }

    @Test
    void olmayanBelgeIndirilemezVe404Doner() throws Exception {
        mockMvc.perform(get("/api/documents/999999/document"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Doküman bulunamadı."));
    }
}
