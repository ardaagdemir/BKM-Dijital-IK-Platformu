package com.digitalik.organization.service;

import com.digitalik.organization.entity.PolicyDocument;
import com.digitalik.organization.entity.PolicyDocumentStatus;
import com.digitalik.organization.exception.PolicyDocumentNotFoundException;
import com.digitalik.organization.repository.PolicyDocumentRepository;
import com.digitalik.platform.file.InfectedFileException;
import com.digitalik.platform.file.VirusScanService;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-08I.1.1: Politika dokümanı yükleme/versiyonlama. Kabul kriteri:
 * "Yeni versiyon eskisini arşivler."
 *
 * <p>US-09.7.2: {@link VirusScanService} — kaydetmeden ÖNCE tarama.
 * Bu entity {@code platform.file.FileStorageService}'e taşınmadığından
 * (bkz. o servisin javadoc'u), tarama BURADA doğrudan çağrılıyor.
 */
@Service
public class PolicyDocumentService {

    private final PolicyDocumentRepository policyDocumentRepository;
    private final VirusScanService virusScanService;

    public PolicyDocumentService(
            PolicyDocumentRepository policyDocumentRepository, VirusScanService virusScanService) {
        this.policyDocumentRepository = policyDocumentRepository;
        this.virusScanService = virusScanService;
    }

    /**
     * {@code previousVersionId} verilmezse yeni bir doküman (v1) açılır —
     * {@code title} bu durumda ZORUNLU. Verilirse: önceki versiyon
     * bulunur (yalnızca {@code ACTIVE} bir versiyon üzerinden yeni
     * versiyon yüklenebilir — zaten arşivlenmiş bir versiyondan
     * dallanmayı önlemek için), ARŞİVLENİR (kabul kriterinin kendisi), ve
     * yeni versiyon önceki versiyonun BAŞLIĞINI miras alır (istemcinin
     * gönderdiği başlık YOK SAYILIR — bir dokümanın versiyonları arasında
     * başlık kaymasını önlemek için).
     */
    public PolicyDocument upload(
            String title, String fileName, String contentType, byte[] documentData, Long previousVersionId) {
        if (fileName == null || contentType == null || documentData == null || documentData.length == 0) {
            throw new IllegalArgumentException("Doküman dosyası boş olamaz.");
        }
        if (virusScanService.isInfected(documentData)) {
            throw new InfectedFileException();
        }

        int version;
        String resolvedTitle;
        PolicyDocument previous = null;
        if (previousVersionId != null) {
            previous = policyDocumentRepository.findById(previousVersionId).orElseThrow(PolicyDocumentNotFoundException::new);
            if (previous.getStatus() != PolicyDocumentStatus.ACTIVE) {
                throw new IllegalArgumentException("Yalnızca güncel (aktif) bir versiyon üzerinden yeni versiyon yüklenebilir.");
            }
            version = previous.getVersion() + 1;
            resolvedTitle = previous.getTitle();
        } else {
            if (title == null || title.isBlank()) {
                throw new IllegalArgumentException("Başlık boş olamaz.");
            }
            version = 1;
            resolvedTitle = title;
        }

        if (previous != null) {
            previous.archive();
            policyDocumentRepository.save(previous);
        }

        return policyDocumentRepository.save(
                new PolicyDocument(resolvedTitle, version, fileName, contentType, documentData, previousVersionId));
    }

    /** Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor. */
    public List<PolicyDocument> getAll() {
        return policyDocumentRepository.findAll();
    }

    /**
     * US-08I.1.1'in ön-koşulu: belge dosyasını İNDİRMEK için — {@code
     * getAll()}'ın döndürdüğü {@code PolicyDocumentResponse} yalnızca
     * meta veri taşır, dosya baytlarını DEĞİL (`travel.ExpenseItemService.get`'teki
     * AYNI gerekçe).
     */
    public PolicyDocument getById(Long id) {
        return policyDocumentRepository.findById(id).orElseThrow(PolicyDocumentNotFoundException::new);
    }
}
