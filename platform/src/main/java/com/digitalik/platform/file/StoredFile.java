package com.digitalik.platform.file;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * US-09.7.1: Genel amaçlı, meta veri + ikili içeriği bir arada tutan dosya
 * kaydı — {@code organization.PolicyDocument}/{@code recruitment.Candidate}
 * /{@code travel.ExpenseItem}'daki tekrarlanan deseni paylaşılan tek bir
 * yere toplar.
 *
 * <p>{@code fileData}, {@code recruitment.Candidate.cvData}'daki (V23)
 * canlıda yaşanan hatadan alınan AYNI dersle {@code @JdbcTypeCode(VARBINARY)}
 * ile eşlendi — {@code @Lob} DEĞİL (Hibernate'in bunu PostgreSQL'in {@code
 * oid} mekanizmasına eşlemesini önlemek için).
 */
@Entity
@Table(name = "stored_files")
public class StoredFile extends BaseEntity {

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String contentType;

    @JdbcTypeCode(SqlTypes.VARBINARY)
    @Column(nullable = false)
    private byte[] fileData;

    protected StoredFile() {
        // JPA için
    }

    public StoredFile(String fileName, String contentType, byte[] fileData) {
        this.fileName = fileName;
        this.contentType = contentType;
        this.fileData = fileData;
    }

    public String getFileName() {
        return fileName;
    }

    public String getContentType() {
        return contentType;
    }

    public byte[] getFileData() {
        return fileData;
    }
}
