package com.digitalik.recruitment.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * US-05.2.2: Aday profiline eklenen bir not — çoklu kayıt (bir adayın
 * birden fazla notu olabilir, {@code organization.EmployeeAsset}'teki aynı
 * desen). Salt-ekleme: güncelleme/silme metodu yok, notlar bir görüşme
 * geçmişi gibi değişmez kalır.
 *
 * <p>{@code candidateId}, {@code Candidate} AYNI modülde ({@code recruitment})
 * olduğundan gerçek bir DB FK'ye sahip (bkz. V24 migration'ı) —
 * {@code leave.LeaveRequest.employeeId}'deki cross-module kısıtla
 * KARIŞTIRILMAMALI.
 */
@Entity
@Table(name = "candidate_notes")
public class CandidateNote extends BaseEntity {

    @Column(nullable = false)
    private Long candidateId;

    @Column(nullable = false)
    private String noteText;

    protected CandidateNote() {
        // JPA için
    }

    public CandidateNote(Long candidateId, String noteText) {
        this.candidateId = candidateId;
        this.noteText = noteText;
    }

    public Long getCandidateId() {
        return candidateId;
    }

    public String getNoteText() {
        return noteText;
    }
}
