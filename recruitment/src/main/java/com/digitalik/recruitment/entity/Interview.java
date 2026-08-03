package com.digitalik.recruitment.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDate;

/**
 * US-05.4.1: Bir adayın mülakat kaydı (tarih/katılımcı/sonuç) — çoklu kayıt
 * (bir adayın birden fazla mülakatı olabilir, {@code CandidateNote}'daki
 * aynı desen). Salt-ekleme: güncelleme/silme metodu yok.
 *
 * <p>{@code participants} (katılımcılar) ve {@code result} (sonuç) BİLİNÇLİ
 * OLARAK düz metin — projede henüz mülakatçı/görüşmeci için bir kullanıcı
 * referans mekanizması yok (o, ayrı bir story/ihtiyaç); kabul kriteri de
 * yalnızca "kaydetmek" diyor, yapılandırılmış bir puanlama/sonuç kodu
 * istemiyor (YAGNI).
 */
@Entity
@Table(name = "interviews")
public class Interview extends BaseEntity {

    @Column(nullable = false)
    private Long candidateId;

    @Column(nullable = false)
    private LocalDate interviewDate;

    @Column(nullable = false)
    private String participants;

    @Column(nullable = false)
    private String result;

    protected Interview() {
        // JPA için
    }

    public Interview(Long candidateId, LocalDate interviewDate, String participants, String result) {
        this.candidateId = candidateId;
        this.interviewDate = interviewDate;
        this.participants = participants;
        this.result = result;
    }

    public Long getCandidateId() {
        return candidateId;
    }

    public LocalDate getInterviewDate() {
        return interviewDate;
    }

    public String getParticipants() {
        return participants;
    }

    public String getResult() {
        return result;
    }
}
