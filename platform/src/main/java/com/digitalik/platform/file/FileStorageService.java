package com.digitalik.platform.file;

import org.springframework.stereotype.Service;

/**
 * US-09.7.1: Genel dosya saklama servisi. Kabul kriteri: "Servis, meta veri
 * + ikili içeriği ayrı katmanlarda tutar; mevcut modüller buna taşınır."
 *
 * <p>{@code travel.ExpenseItem} bu servise taşındı (bkz. ilgili migration'ın
 * javadoc'u) — {@code organization.PolicyDocument}/{@code
 * recruitment.Candidate.cvData} BİLİNÇLİ OLARAK taşınmadı (kendi
 * versiyonlama/CV-özgü mantıkları nedeniyle); virüs tarama (US-09.7.2) yine
 * de bu servisten BAĞIMSIZ olarak o ikisinin kendi yükleme akışlarına
 * doğrudan entegre edilecek.
 *
 * <p>US-09.7.2: {@link #store} artık kaydetmeden ÖNCE {@link VirusScanService}
 * ile tarıyor — enfekte bir dosya HİÇ persist edilmez.
 */
@Service
public class FileStorageService {

    private final StoredFileRepository storedFileRepository;
    private final VirusScanService virusScanService;

    public FileStorageService(StoredFileRepository storedFileRepository, VirusScanService virusScanService) {
        this.storedFileRepository = storedFileRepository;
        this.virusScanService = virusScanService;
    }

    public StoredFile store(String fileName, String contentType, byte[] fileData) {
        if (virusScanService.isInfected(fileData)) {
            throw new InfectedFileException();
        }
        return storedFileRepository.save(new StoredFile(fileName, contentType, fileData));
    }

    public StoredFile retrieve(Long id) {
        return storedFileRepository.findById(id).orElseThrow(StoredFileNotFoundException::new);
    }

    public void delete(Long id) {
        if (!storedFileRepository.existsById(id)) {
            throw new StoredFileNotFoundException();
        }
        storedFileRepository.deleteById(id);
    }
}
