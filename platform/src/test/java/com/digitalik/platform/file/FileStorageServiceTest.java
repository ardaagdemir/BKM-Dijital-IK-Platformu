package com.digitalik.platform.file;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

/** US-09.7.1 kabul kriteri: "Servis, meta veri + ikili içeriği ayrı katmanlarda tutar." */
@SpringBootTest
@Transactional
class FileStorageServiceTest {

    @Autowired
    private FileStorageService fileStorageService;

    @Test
    void depolananDosyaAyniIcerikleGeriOkunur() {
        StoredFile stored = fileStorageService.store("fatura.pdf", "application/pdf", "fatura-icerigi".getBytes());

        StoredFile retrieved = fileStorageService.retrieve(stored.getId());

        assertThat(retrieved.getFileName()).isEqualTo("fatura.pdf");
        assertThat(retrieved.getContentType()).isEqualTo("application/pdf");
        assertThat(retrieved.getFileData()).isEqualTo("fatura-icerigi".getBytes());
    }

    @Test
    void olmayanDosyaIstenirseAcikHataFirlatilir() {
        assertThatThrownBy(() -> fileStorageService.retrieve(999999L))
                .isInstanceOf(StoredFileNotFoundException.class)
                .hasMessage("Dosya bulunamadı.");
    }

    @Test
    void dosyaSilinebilir() {
        StoredFile stored = fileStorageService.store("fis.jpg", "image/jpeg", "fis-icerigi".getBytes());

        fileStorageService.delete(stored.getId());

        assertThatThrownBy(() -> fileStorageService.retrieve(stored.getId()))
                .isInstanceOf(StoredFileNotFoundException.class);
    }

    @Test
    void olmayanDosyaSilinemezVeAcikHataFirlatilir() {
        assertThatThrownBy(() -> fileStorageService.delete(999999L)).isInstanceOf(StoredFileNotFoundException.class);
    }
}
