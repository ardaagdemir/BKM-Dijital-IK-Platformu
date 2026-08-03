package com.digitalik.amenities.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * US-08H.1.2: Bir çalışanın bir {@link AppointmentSlot}'a aldığı randevu.
 * Kabul kriteri: "Aynı saatte ikinci randevu engellenir." — bu kural
 * {@code AppointmentService.book} içinde, çalışanın var olan
 * randevularının slot zaman aralıklarıyla kesişim kontrolüyle uygulanıyor.
 *
 * <p>Bir slotun yalnızca BİR kez rezerve edilebilmesi de (varsayılan
 * kapasite=1, FR-1202'nin "grup seansı" zenginliği taşınmadı) AYNI
 * serviste kontrol ediliyor.
 *
 * <p>{@code slotId}, AYNI modül içindeki {@link AppointmentSlot}'a normal
 * bir FK ile bağlıdır; {@code employeeId} ise diğer tüm modüllerdeki AYNI
 * modüller-arası güven sınırı gerekçesiyle FK'siz düz bir {@code Long}.
 *
 * <p>US-08H.1.3 (SEC-020): {@code note} (V56) — sağlık/kişisel veri
 * içerebilir; {@code AppointmentController}'ın normal yanıtlarına HİÇ
 * dahil edilmiyor, yalnızca ayrı, `@PreAuthorize`'lı bir uçtan
 * ({@code AppointmentNoteController}) okunabiliyor — {@code
 * organization.EmployeeSalaryRecord}'daki (US-03.3.3/US-03.3.4) AYNI
 * "hassas alanı ayrı bir alt kaynağa çıkar" deseni.
 */
@Entity
@Table(name = "appointments")
public class Appointment extends BaseEntity {

    @Column(nullable = false)
    private Long slotId;

    @Column(nullable = false)
    private Long employeeId;

    private String note;

    protected Appointment() {
        // JPA için
    }

    public Appointment(Long slotId, Long employeeId) {
        this.slotId = slotId;
        this.employeeId = employeeId;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Long getSlotId() {
        return slotId;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public String getNote() {
        return note;
    }
}
