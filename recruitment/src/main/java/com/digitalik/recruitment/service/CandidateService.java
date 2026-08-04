package com.digitalik.recruitment.service;

import com.digitalik.platform.file.InfectedFileException;
import com.digitalik.platform.file.VirusScanService;
import com.digitalik.recruitment.entity.Candidate;
import com.digitalik.recruitment.entity.CandidateStage;
import com.digitalik.recruitment.exception.CandidateNotFoundException;
import com.digitalik.recruitment.repository.CandidateRepository;
import org.springframework.stereotype.Service;

/**
 * US-05.2.1: Aday başvurusu oluşturma. Kimlik doğrulaması gerektirmeyen bir
 * uçtan (bkz. {@code CandidateController}) çağrıldığından — projedeki İLK
 * herkese açık YAZMA işlemi — girdi doğrulaması özellikle önemli (bkz. aşağı).
 *
 * <p>US-05.2.2: {@link #changeStage} ile süreç aşaması güncellenir. Not
 * ekleme AYRI bir {@code CandidateNoteService}'te (çoklu kayıt, farklı bir
 * kaygı — bkz. {@code organization.EmployeeAssetService}'teki aynı ayrım).
 *
 * <p>US-05.4.2: {@link #convertToEmployee} ile aday "dönüştürüldü" olarak
 * işaretlenir; {@code organization.Employee} tablosunda GERÇEK bir kayıt
 * OLUŞTURMAZ (bkz. {@code Candidate.convertToEmployee()}'deki ayrıntılı not).
 *
 * <p>US-09.7.2: {@link VirusScanService} ile CV taraması — bu uç kimliksiz/
 * herkese açık olduğundan (yukarı bkz.) özellikle önemli bir giriş noktası.
 */
@Service
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final VirusScanService virusScanService;

    public CandidateService(CandidateRepository candidateRepository, VirusScanService virusScanService) {
        this.candidateRepository = candidateRepository;
        this.virusScanService = virusScanService;
    }

    public Candidate apply(
            String firstName,
            String lastName,
            String email,
            String appliedPosition,
            String cvFileName,
            String cvContentType,
            byte[] cvData) {
        assertNotBlank(firstName, "Ad boş olamaz.");
        assertNotBlank(lastName, "Soyad boş olamaz.");
        assertNotBlank(email, "E-posta boş olamaz.");
        assertNotBlank(appliedPosition, "Başvurulan pozisyon boş olamaz.");
        if (cvData == null || cvData.length == 0) {
            throw new IllegalArgumentException("CV dosyası boş olamaz.");
        }
        assertNotBlank(cvFileName, "CV dosya adı boş olamaz.");
        if (virusScanService.isInfected(cvData)) {
            throw new InfectedFileException();
        }

        return candidateRepository.save(
                new Candidate(firstName, lastName, email, appliedPosition, cvFileName, cvContentType, cvData));
    }

    public Candidate changeStage(Long candidateId, CandidateStage stage) {
        Candidate candidate = candidateRepository.findById(candidateId).orElseThrow(CandidateNotFoundException::new);
        if (stage == null) {
            throw new IllegalArgumentException("Aşama boş olamaz.");
        }

        candidate.changeStage(stage);
        return candidateRepository.save(candidate);
    }

    public Candidate convertToEmployee(Long candidateId) {
        Candidate candidate = candidateRepository.findById(candidateId).orElseThrow(CandidateNotFoundException::new);
        if (candidate.isConverted()) {
            throw new IllegalArgumentException("Bu aday zaten bir çalışan kaydına dönüştürülmüş.");
        }

        candidate.convertToEmployee();
        return candidateRepository.save(candidate);
    }

    private void assertNotBlank(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
    }
}
