package com.digitalik.feedback.service;

import com.digitalik.feedback.entity.Survey;
import com.digitalik.feedback.entity.SurveyAnswer;
import com.digitalik.feedback.entity.SurveyOption;
import com.digitalik.feedback.exception.SurveyNotFoundException;
import com.digitalik.feedback.exception.SurveyOptionNotFoundException;
import com.digitalik.feedback.repository.SurveyAnswerRepository;
import com.digitalik.feedback.repository.SurveyOptionRepository;
import com.digitalik.feedback.repository.SurveyRepository;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

/**
 * US-08E.1.2: Ankete yanıt verme. Kabul kriteri: "Yanıt kaydedilir; anonim
 * seçeneği varsa kullanıcı bilgisi tutulmaz."
 */
@Service
public class SurveyAnswerService {

    private final SurveyRepository surveyRepository;
    private final SurveyOptionRepository surveyOptionRepository;
    private final SurveyAnswerRepository surveyAnswerRepository;

    public SurveyAnswerService(
            SurveyRepository surveyRepository,
            SurveyOptionRepository surveyOptionRepository,
            SurveyAnswerRepository surveyAnswerRepository) {
        this.surveyRepository = surveyRepository;
        this.surveyOptionRepository = surveyOptionRepository;
        this.surveyAnswerRepository = surveyAnswerRepository;
    }

    /**
     * Anket {@link Survey#isAnonymous()} ise {@code employeeId} HİÇ
     * kaydedilmez (istemci gönderse bile) — kabul kriterinin "kullanıcı
     * bilgisi tutulmaz" şartı, isteğin göz ardı edilmesi değil, VERİNİN
     * kalıcı olarak yazılmaması anlamına geliyor. Anonim OLMAYAN bir
     * ankette ise {@code employeeId} zorunludur (yanıtın kime ait olduğu
     * bilinmeli).
     */
    public SurveyAnswer submit(Long surveyId, Long surveyOptionId, Long employeeId) {
        Survey survey = surveyRepository.findById(surveyId).orElseThrow(SurveyNotFoundException::new);

        if (surveyOptionId == null) {
            throw new IllegalArgumentException("Seçenek boş olamaz.");
        }
        SurveyOption option =
                surveyOptionRepository.findById(surveyOptionId).orElseThrow(SurveyOptionNotFoundException::new);
        if (!option.getSurveyId().equals(surveyId)) {
            throw new IllegalArgumentException("Seçenek bu ankete ait değil.");
        }

        Long storedEmployeeId;
        if (survey.isAnonymous()) {
            storedEmployeeId = null;
        } else {
            if (employeeId == null) {
                throw new IllegalArgumentException("Çalışan boş olamaz.");
            }
            storedEmployeeId = employeeId;
        }

        return surveyAnswerRepository.save(new SurveyAnswer(surveyId, surveyOptionId, storedEmployeeId));
    }

    /**
     * US-08E.1.3: Anket sonuçlarını seçenek bazlı yüzdesel dağılımla döner.
     * Kabul kriteri yalnızca "seçenek bazlı yüzde gösterir" diyor —
     * FR-702'nin "yöneticinin kimin hangi seçeneğe oy verdiğini
     * görebilmesi" zenginliği BİLİNÇLİ OLARAK taşınmadı (zaten anonim bir
     * ankette bu prensip olarak mümkün değil). Hiç yanıt yoksa (toplam 0)
     * bölme hatası yerine tüm seçenekler %0 olarak döner.
     */
    public SurveyResults getResults(Long surveyId) {
        Survey survey = surveyRepository.findById(surveyId).orElseThrow(SurveyNotFoundException::new);
        List<SurveyOption> options = surveyOptionRepository.findBySurveyIdOrderByIdAsc(surveyId);
        List<SurveyAnswer> answers = surveyAnswerRepository.findBySurveyId(surveyId);

        Map<Long, Long> voteCountsByOptionId =
                answers.stream().collect(Collectors.groupingBy(SurveyAnswer::getSurveyOptionId, Collectors.counting()));
        long totalResponses = answers.size();

        List<OptionResult> optionResults = options.stream()
                .map(option -> {
                    long voteCount = voteCountsByOptionId.getOrDefault(option.getId(), 0L);
                    double percentage = totalResponses == 0 ? 0.0 : roundToOneDecimal(voteCount * 100.0 / totalResponses);
                    return new OptionResult(option.getId(), option.getText(), voteCount, percentage);
                })
                .toList();

        return new SurveyResults(survey.getId(), survey.getQuestion(), totalResponses, optionResults);
    }

    private static double roundToOneDecimal(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    public record OptionResult(Long optionId, String optionText, long voteCount, double percentage) {
    }

    public record SurveyResults(Long surveyId, String question, long totalResponses, List<OptionResult> options) {
    }
}
