package com.digitalik.travel.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * US-08B.1.2: Bir seyahat talebine (bkz. {@link TravelRequest}) bağlı masraf
 * kalemi — tutar + belge (makbuz/fatura). {@code travelRequestId}, AYNI
 * modül içindeki {@link TravelRequest}'e normal bir FK ile bağlı.
 *
 * <p>{@code documentData}, {@code recruitment.Candidate.cvData}'daki (V23)
 * AYNI dersle {@code @JdbcTypeCode(SqlTypes.VARBINARY)} ile eşlendi — {@code
 * @Lob} DEĞİL, aksi halde Hibernate PostgreSQL'de bunu {@code oid}
 * mekanizmasına eşler ve düz bir {@code bytea} sütunuyla şema doğrulaması
 * canlıda başarısız olur.
 *
 * <p>US-08B.1.3: {@code status}/{@link #approve()}/{@link #reject(String)} —
 * {@code leave.LeaveRequest}/{@code training.TrainingEnrollment}'teki AYNI
 * "talep→onay" deseninin tekrar kullanımı; {@code PENDING} durumuyla
 * oluşturulur.
 */
@Entity
@Table(name = "expense_items")
public class ExpenseItem extends BaseEntity {

    @Column(nullable = false)
    private Long travelRequestId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String documentFileName;

    @Column(nullable = false)
    private String documentContentType;

    @JdbcTypeCode(SqlTypes.VARBINARY)
    @Column(nullable = false)
    private byte[] documentData;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExpenseItemStatus status;

    private String rejectionReason;

    protected ExpenseItem() {
        // JPA için
    }

    public ExpenseItem(
            Long travelRequestId,
            BigDecimal amount,
            String documentFileName,
            String documentContentType,
            byte[] documentData) {
        this.travelRequestId = travelRequestId;
        this.amount = amount;
        this.documentFileName = documentFileName;
        this.documentContentType = documentContentType;
        this.documentData = documentData;
        this.status = ExpenseItemStatus.PENDING;
    }

    public void approve() {
        this.status = ExpenseItemStatus.APPROVED;
    }

    public void reject(String rejectionReason) {
        this.status = ExpenseItemStatus.REJECTED;
        this.rejectionReason = rejectionReason;
    }

    public Long getTravelRequestId() {
        return travelRequestId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getDocumentFileName() {
        return documentFileName;
    }

    public String getDocumentContentType() {
        return documentContentType;
    }

    public byte[] getDocumentData() {
        return documentData;
    }

    public ExpenseItemStatus getStatus() {
        return status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }
}
