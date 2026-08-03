package com.digitalik.organization.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * US-08I.1.1: Bir politika/prosedür/talimat dokümanının bir versiyonu.
 * Kabul kriteri: "Yeni versiyon eskisini arşivler."
 *
 * <p>{@code documentData}, {@code recruitment.Candidate.cvData}'daki
 * (V23) canlıda yaşanan hatadan PROAKTİF ders alınarak baştan {@code
 * @Lob} DEĞİL {@code @JdbcTypeCode(VARBINARY)} ile yazıldı — Hibernate'in
 * bunu PostgreSQL'in {@code oid} mekanizmasına eşlemesini önlemek için.
 *
 * <p>{@code previousVersionId} NULLABLE — NULL ise bu satır dokümanın İLK
 * versiyonu. {@link #archive()} ile eski versiyon GERÇEKTEN {@code
 * UPDATE} edilir (status: ACTIVE→ARCHIVED) — {@code
 * discipline.DisciplinaryCase}'deki (US-08C.1.3) AKSİNE burada bir
 * SEC-021 tipi değiştirilemezlik şartı YOK, kabul kriterinin "arşivler"
 * ifadesi sıradan bir durum geçişi.
 */
@Entity
@Table(name = "policy_documents")
public class PolicyDocument extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private int version;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String contentType;

    @JdbcTypeCode(SqlTypes.VARBINARY)
    @Column(nullable = false)
    private byte[] documentData;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PolicyDocumentStatus status;

    private Long previousVersionId;

    protected PolicyDocument() {
        // JPA için
    }

    public PolicyDocument(
            String title, int version, String fileName, String contentType, byte[] documentData, Long previousVersionId) {
        this.title = title;
        this.version = version;
        this.fileName = fileName;
        this.contentType = contentType;
        this.documentData = documentData;
        this.previousVersionId = previousVersionId;
        this.status = PolicyDocumentStatus.ACTIVE;
    }

    public void archive() {
        this.status = PolicyDocumentStatus.ARCHIVED;
    }

    public String getTitle() {
        return title;
    }

    public int getVersion() {
        return version;
    }

    public String getFileName() {
        return fileName;
    }

    public String getContentType() {
        return contentType;
    }

    public byte[] getDocumentData() {
        return documentData;
    }

    public PolicyDocumentStatus getStatus() {
        return status;
    }

    public Long getPreviousVersionId() {
        return previousVersionId;
    }
}
