package com.digitalik.recruitment.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.Instant;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * US-05.2.1: Bir adayın harici başvuru sayfasından oluşturduğu başvuru
 * kaydı — temel bilgiler (ad-soyad, e-posta, başvurulan pozisyon) + CV
 * dosyası. Kimlik doğrulaması gerektirmeyen bir uçtan ({@code CandidateController})
 * oluşturulur (bkz. {@code auth.SecurityConfig}'teki {@code permitAll} kuralı).
 *
 * <p>CV, ayrı bir dosya depolama servisi olmadan doğrudan veritabanında
 * ({@code cvData}, bytea) tutuluyor — bkz. V23 migration'ındaki not (roadmap
 * Bölüm 9.7'nin genelleştirme eşiği henüz burada değil).
 *
 * <p><b>Canlıda bulunan, düzeltilen hata:</b> {@code cvData} başta
 * {@code @Lob byte[]} idi; Hibernate 6, PostgreSQL'de bunu varsayılan olarak
 * büyük nesne (Large Object, {@code oid} sütun tipi) mekanizmasına eşliyor —
 * ama V23 migration'ı düz bir {@code bytea} sütunu oluşturuyordu. Sonuç:
 * `mvn test` (H2, bu ayrımı yapmıyor) yeşildi ama Docker'da gerçek
 * PostgreSQL'e karşı "Schema-validation: wrong column type... found
 * [bytea], but expecting [oid]" ile uygulama hiç açılmadı. Çözüm:
 * {@code @Lob} yerine {@code @JdbcTypeCode(SqlTypes.VARBINARY)} — Hibernate'e
 * bunu açıkça {@code bytea} olarak eşlemesini söylüyor.
 *
 * <p>"İletişim" alanı olarak yalnızca {@code email} seçildi —
 * {@code organization.Employee}'deki (US-03.2.1) aynı YAGNI kararı.
 *
 * <p>US-05.2.2: {@link #changeStage(CandidateStage)} ile süreç aşaması
 * (başvuru/mülakat/teklif/işe alım/ret) güncellenir; oluşturmada varsayılan
 * {@link CandidateStage#APPLICATION}. Aşama geçişleri arasında bir durum
 * makinesi (ör. "HIRED'dan APPLICATION'a dönülemez") kurulmadı — kabul
 * kriteri yalnızca "güncellenebilir" diyor, geçiş kısıtı istemiyor (YAGNI).
 *
 * <p>US-05.4.2: {@link #convertToEmployee()} ile aday "dönüştürüldü" olarak
 * işaretlenir ({@code convertedAt} doldurulur, aşama {@link CandidateStage#HIRED}
 * olur) — bu, {@code organization.Employee} tablosunda GERÇEK bir kayıt
 * OLUŞTURMAZ ({@code recruitment}, {@code organization}'a bağımlı değil).
 * Kabul kriteri zaten "manuel tetiklemeli, tam otomatik senkron değil" diyor
 * — asıl çalışan kaydı, İK kullanıcısının bu uçtan dönen taslak bilgilerle
 * AYRICA {@code POST /api/organization/employees}'i çağırmasıyla oluşur.
 */
@Entity
@Table(name = "candidates")
public class Candidate extends BaseEntity {

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String email;

    @Column(name = "applied_position", nullable = false)
    private String appliedPosition;

    @Column(nullable = false)
    private String cvFileName;

    @Column(nullable = false)
    private String cvContentType;

    @JdbcTypeCode(SqlTypes.VARBINARY)
    @Column(nullable = false)
    private byte[] cvData;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CandidateStage stage;

    @Column
    private Instant convertedAt;

    protected Candidate() {
        // JPA için
    }

    public Candidate(
            String firstName,
            String lastName,
            String email,
            String appliedPosition,
            String cvFileName,
            String cvContentType,
            byte[] cvData) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.appliedPosition = appliedPosition;
        this.cvFileName = cvFileName;
        this.cvContentType = cvContentType;
        this.cvData = cvData;
        this.stage = CandidateStage.APPLICATION;
    }

    public void changeStage(CandidateStage stage) {
        this.stage = stage;
    }

    public boolean isConverted() {
        return convertedAt != null;
    }

    public void convertToEmployee() {
        this.convertedAt = Instant.now();
        this.stage = CandidateStage.HIRED;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getAppliedPosition() {
        return appliedPosition;
    }

    public String getCvFileName() {
        return cvFileName;
    }

    public String getCvContentType() {
        return cvContentType;
    }

    public byte[] getCvData() {
        return cvData;
    }

    public CandidateStage getStage() {
        return stage;
    }

    public Instant getConvertedAt() {
        return convertedAt;
    }
}
