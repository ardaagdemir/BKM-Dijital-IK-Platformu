package com.digitalik.discipline.service;

import com.digitalik.discipline.entity.DisciplinaryCase;
import com.digitalik.discipline.entity.DisciplinaryCaseStatus;
import com.digitalik.discipline.exception.DisciplinaryCaseNotFoundException;
import com.digitalik.discipline.repository.DisciplinaryCaseRepository;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

/**
 * US-08C.1.2: Ceza süreci kaydı — açma, savunma kaydetme, kapatma. Kabul
 * kriteri: "Savunma alanı boşken süreç tamamlanamaz." — asıl kural
 * doğrulaması {@link #close(Long)}'da.
 *
 * <p><b>US-08C.1.3 (SEC-021):</b> Bu servis, fetch ettiği bir {@link
 * DisciplinaryCase} örneğini ARTIK HİÇBİR ZAMAN mutasyona uğratıp tekrar
 * {@code save} etmiyor — her değişiklik, {@code
 * DisciplinaryCase.reviseWithDefense}/{@code reviseAsClosed} statik
 * fabrikalarıyla üretilen YENİ bir revizyon satırının eklenmesiyle
 * (INSERT) yapılıyor; var olan satırlar hiçbir zaman UPDATE görmüyor.
 */
@Service
public class DisciplinaryCaseService {

    private final DisciplinaryCaseRepository disciplinaryCaseRepository;

    public DisciplinaryCaseService(DisciplinaryCaseRepository disciplinaryCaseRepository) {
        this.disciplinaryCaseRepository = disciplinaryCaseRepository;
    }

    public DisciplinaryCase create(Long employeeId, String reason) {
        if (employeeId == null) {
            throw new IllegalArgumentException("Çalışan boş olamaz.");
        }
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Gerekçe boş olamaz.");
        }

        return disciplinaryCaseRepository.save(DisciplinaryCase.open(employeeId, reason));
    }

    /** US-08C.1.2: Çalışanın savunması, süreç henüz açıkken herhangi bir anda kaydedilebilir/güncellenebilir. */
    public DisciplinaryCase recordDefense(Long caseId, String defense) {
        DisciplinaryCase latest = latestRevision(caseId);

        if (defense == null || defense.isBlank()) {
            throw new IllegalArgumentException("Savunma boş olamaz.");
        }
        if (latest.getStatus() != DisciplinaryCaseStatus.OPEN) {
            throw new IllegalArgumentException("Kapatılmış bir sürece savunma eklenemez.");
        }

        return disciplinaryCaseRepository.save(DisciplinaryCase.reviseWithDefense(latest, defense));
    }

    /**
     * US-08C.1.2 kritik kural: savunma alınmadan süreç kapanamaz (FR-1314).
     * Zaten kapalı bir sürecin tekrar kapatılması da reddedilir — diğer tüm
     * modüllerdeki (ör. {@code training.TrainingEnrollmentService.decide})
     * AYNI "yalnızca bekleyen/açık bir kayıt işlem görebilir" deseni.
     */
    public DisciplinaryCase close(Long caseId) {
        DisciplinaryCase latest = latestRevision(caseId);

        if (latest.getStatus() != DisciplinaryCaseStatus.OPEN) {
            throw new IllegalArgumentException("Bu süreç zaten kapatılmış.");
        }
        if (latest.getDefense() == null || latest.getDefense().isBlank()) {
            throw new IllegalArgumentException("Savunma alınmadan ceza süreci tamamlanamaz.");
        }

        return disciplinaryCaseRepository.save(DisciplinaryCase.reviseAsClosed(latest));
    }

    /**
     * Bölüm 14.7/8C (frontend) sırasında bulunan boşluk: {@code
     * findRevisionsByRootId} yalnızca BU servisin İÇİNDE ({@link
     * #latestRevision}) kullanılıyordu, DIŞARIYA hiç açılmamıştı — roadmap'in
     * "mevcut kayıt AccordionList ile geçmiş revizyonları gösterir" notu
     * bunu GEREKTİRİYOR (bkz. {@code DisciplinaryCaseController#getRevisions}).
     * En yeni revizyon İLK sırada (bkz. repository sorgusu).
     */
    public List<DisciplinaryCase> getRevisions(Long caseId) {
        List<DisciplinaryCase> revisions = disciplinaryCaseRepository.findRevisionsByRootId(caseId);
        if (revisions.isEmpty()) {
            throw new DisciplinaryCaseNotFoundException();
        }
        return revisions;
    }

    /**
     * US-08C.1.3: {@code caseId}, sürecin dışarıya gösterilen KÖK id'sidir
     * (bkz. {@code DisciplinaryCaseController.toResponse}); bu sürece ait
     * tüm revizyonlar arasından en güncel olanı (en yüksek id) döner.
     */
    private DisciplinaryCase latestRevision(Long caseId) {
        if (caseId == null) {
            throw new DisciplinaryCaseNotFoundException();
        }
        List<DisciplinaryCase> revisions = disciplinaryCaseRepository.findRevisionsByRootId(caseId);
        if (revisions.isEmpty()) {
            throw new DisciplinaryCaseNotFoundException();
        }
        return revisions.get(0);
    }

    /**
     * Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor.
     *
     * <p>US-08C.1.3: Repository'den dönen liste TÜM revizyonları içerir;
     * burada kök sürece göre gruplanıp her süreç için yalnızca en GÜNCEL
     * revizyon döndürülür — dışarıya, US-08C.1.2'deki gibi "her süreç tek
     * satır" görünümü korunur.
     */
    public List<DisciplinaryCase> listByEmployee(Long employeeId) {
        if (employeeId == null) {
            throw new IllegalArgumentException("Çalışan boş olamaz.");
        }

        Map<Long, DisciplinaryCase> latestByCase = new LinkedHashMap<>();
        for (DisciplinaryCase revision : disciplinaryCaseRepository.findByEmployeeIdOrderByIdDesc(employeeId)) {
            latestByCase.merge(
                    revision.rootCaseId(), revision, (a, b) -> a.getId() > b.getId() ? a : b);
        }

        return latestByCase.values().stream()
                .sorted((a, b) -> Long.compare(b.rootCaseId(), a.rootCaseId()))
                .toList();
    }
}
