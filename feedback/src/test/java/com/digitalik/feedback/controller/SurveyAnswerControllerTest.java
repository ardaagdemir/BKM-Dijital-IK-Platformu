package com.digitalik.feedback.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.feedback.dto.CreateSurveyRequest;
import com.digitalik.feedback.dto.SubmitSurveyAnswerRequest;
import com.fasterxml.jackson.databind.JsonNode;
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
 * US-08E.1.2 kabul kriteri: "Çalışan olarak, ankete yanıt vermek
 * istiyorum. Yanıt kaydedilir; anonim seçeneği varsa kullanıcı bilgisi
 * tutulmaz."
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class SurveyAnswerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private JsonNode createSurvey(String question, List<String> options, boolean anonymous) throws Exception {
        String body = mockMvc.perform(post("/api/surveys")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateSurveyRequest(question, options, anonymous))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(body);
    }

    @Test
    void yanitKaydedilirVeKullaniciBilgisiTutulur() throws Exception {
        JsonNode survey = createSurvey("Yemekhane memnuniyeti?", List.of("Evet", "Hayır"), false);
        long surveyId = survey.get("id").asLong();
        long optionId = survey.get("options").get(0).get("id").asLong();

        mockMvc.perform(post("/api/surveys/{surveyId}/answers", surveyId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SubmitSurveyAnswerRequest(optionId, 42L))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.surveyId").value(surveyId))
                .andExpect(jsonPath("$.surveyOptionId").value(optionId))
                .andExpect(jsonPath("$.employeeId").value(42));
    }

    @Test
    void anonimAnkettekiYanittaKullaniciBilgisiTutulmaz() throws Exception {
        JsonNode survey = createSurvey("Şirket kültürü hakkında ne düşünüyorsunuz?", List.of("Olumlu", "Olumsuz"), true);
        long surveyId = survey.get("id").asLong();
        long optionId = survey.get("options").get(0).get("id").asLong();

        mockMvc.perform(post("/api/surveys/{surveyId}/answers", surveyId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SubmitSurveyAnswerRequest(optionId, 42L))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.surveyId").value(surveyId))
                .andExpect(jsonPath("$.surveyOptionId").value(optionId))
                .andExpect(jsonPath("$.employeeId").doesNotExist());
    }

    @Test
    void anonimOlmayanAnkettteCalisanBelirtilmezse400Doner() throws Exception {
        JsonNode survey = createSurvey("Soru?", List.of("Evet", "Hayır"), false);
        long surveyId = survey.get("id").asLong();
        long optionId = survey.get("options").get(0).get("id").asLong();

        mockMvc.perform(post("/api/surveys/{surveyId}/answers", surveyId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SubmitSurveyAnswerRequest(optionId, null))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Çalışan boş olamaz."));
    }

    @Test
    void secenekBelirtilmezse400Doner() throws Exception {
        JsonNode survey = createSurvey("Soru?", List.of("Evet", "Hayır"), false);
        long surveyId = survey.get("id").asLong();

        mockMvc.perform(post("/api/surveys/{surveyId}/answers", surveyId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SubmitSurveyAnswerRequest(null, 42L))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Seçenek boş olamaz."));
    }

    @Test
    void baskaAnketinSecenegiyleYanitVerilmezVe400Doner() throws Exception {
        JsonNode surveyA = createSurvey("Soru A?", List.of("A1", "A2"), false);
        JsonNode surveyB = createSurvey("Soru B?", List.of("B1", "B2"), false);
        long surveyBId = surveyB.get("id").asLong();
        long optionFromA = surveyA.get("options").get(0).get("id").asLong();

        mockMvc.perform(post("/api/surveys/{surveyId}/answers", surveyBId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SubmitSurveyAnswerRequest(optionFromA, 42L))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Seçenek bu ankete ait değil."));
    }

    @Test
    void olmayanAnketeYanitVerilmezVe404Doner() throws Exception {
        mockMvc.perform(post("/api/surveys/{surveyId}/answers", 999999L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SubmitSurveyAnswerRequest(1L, 42L))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Anket bulunamadı."));
    }

    @Test
    void olmayanSecenekleYanitVerilmezVe404Doner() throws Exception {
        JsonNode survey = createSurvey("Soru?", List.of("Evet", "Hayır"), false);
        long surveyId = survey.get("id").asLong();

        mockMvc.perform(post("/api/surveys/{surveyId}/answers", surveyId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SubmitSurveyAnswerRequest(999999L, 42L))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Seçenek bulunamadı."));
    }
}
