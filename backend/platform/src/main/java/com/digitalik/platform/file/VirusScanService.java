package com.digitalik.platform.file;

/**
 * US-09.7.2: Yüklenen dosyaların virüs taramasından geçmesi. {@code
 * FileStorageService.store}'un İÇİNDE (bkz. o metodun kaynağı) VE ayrıca
 * {@code organization.PolicyDocumentService}/{@code
 * recruitment.CandidateService}'in kendi yükleme akışlarına DOĞRUDAN
 * çağrı olarak (bu ikisi {@code FileStorageService}'e taşınmadığından,
 * bkz. US-09.7.1) entegre edilir — tarama, dosya saklama kararından
 * BAĞIMSIZ olarak tüm yükleme noktalarını kapsar.
 */
public interface VirusScanService {

    boolean isInfected(byte[] data);
}
