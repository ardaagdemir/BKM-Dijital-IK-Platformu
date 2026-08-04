package com.digitalik.feedback.service;

import com.digitalik.feedback.entity.Suggestion;
import com.digitalik.feedback.entity.SuggestionStatus;
import com.digitalik.feedback.exception.SuggestionCategoryNotFoundException;
import com.digitalik.feedback.exception.SuggestionNotFoundException;
import com.digitalik.feedback.repository.SuggestionCategoryRepository;
import com.digitalik.feedback.repository.SuggestionRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-08F.1.1: Talep/fikir gönderimi. Kabul kriteri: "Kategori basit bir
 * referans listesidir; anonim seçeneği desteklenir."
 */
@Service
public class SuggestionService {

    private final SuggestionRepository suggestionRepository;
    private final SuggestionCategoryRepository suggestionCategoryRepository;

    public SuggestionService(
            SuggestionRepository suggestionRepository, SuggestionCategoryRepository suggestionCategoryRepository) {
        this.suggestionRepository = suggestionRepository;
        this.suggestionCategoryRepository = suggestionCategoryRepository;
    }

    /**
     * {@code anonymous} true ise {@code employeeId} istemci gönderse BİLE
     * kaydedilmez (bkz. {@link Suggestion} javadoc'u) — anonim OLMAYAN bir
     * gönderimde ise zorunludur (talebin kime ait olduğu bilinmeli).
     */
    public Suggestion create(Long categoryId, String description, Long employeeId, boolean anonymous) {
        if (categoryId == null) {
            throw new IllegalArgumentException("Kategori boş olamaz.");
        }
        if (!suggestionCategoryRepository.existsById(categoryId)) {
            throw new SuggestionCategoryNotFoundException();
        }
        if (description == null || description.isBlank()) {
            throw new IllegalArgumentException("Açıklama boş olamaz.");
        }

        Long storedEmployeeId;
        if (anonymous) {
            storedEmployeeId = null;
        } else {
            if (employeeId == null) {
                throw new IllegalArgumentException("Çalışan boş olamaz.");
            }
            storedEmployeeId = employeeId;
        }

        return suggestionRepository.save(new Suggestion(categoryId, storedEmployeeId, description));
    }

    /**
     * US-08F.1.2: {@code employeeId} verilmezse (İK'nın durum
     * güncelleyecek talebi bulabilmesi için) TÜM talepler döner — anonim
     * olanlar dahil; verilirse yalnızca o çalışanın (anonim OLMAYAN)
     * talepleri. Rol kısıtlaması eklenmedi — kabul kriteri bundan
     * bahsetmiyor.
     */
    public List<Suggestion> list(Long employeeId) {
        return employeeId == null
                ? suggestionRepository.findAllByOrderByIdDesc()
                : suggestionRepository.findByEmployeeIdOrderByIdDesc(employeeId);
    }

    /**
     * US-08F.1.2 kabul kriteri: "talebin durumunu... güncellemek". Geçiş
     * kısıtlaması İSTENMEDİĞİNDEN herhangi bir durumdan herhangi bir
     * duruma serbestçe geçilebilir — "durum değişikliği çalışana
     * görünür" şartı, GET uçlarının her istekte veriyi taze okumasıyla
     * (bkz. US-02.2.2'deki AYNI gerekçe) otomatik sağlanıyor.
     */
    public Suggestion updateStatus(Long id, String status) {
        Suggestion suggestion = suggestionRepository.findById(id).orElseThrow(SuggestionNotFoundException::new);
        suggestion.updateStatus(parseStatus(status));
        return suggestionRepository.save(suggestion);
    }

    private static SuggestionStatus parseStatus(String status) {
        try {
            return SuggestionStatus.valueOf(status);
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new IllegalArgumentException("Durum yalnızca PENDING, APPROVED veya COMPLETED olabilir.");
        }
    }
}
