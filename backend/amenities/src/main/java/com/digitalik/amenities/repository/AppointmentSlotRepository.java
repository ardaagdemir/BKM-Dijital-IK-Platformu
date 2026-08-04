package com.digitalik.amenities.repository;

import com.digitalik.amenities.entity.AppointmentSlot;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AppointmentSlotRepository extends JpaRepository<AppointmentSlot, Long> {

    /** US-08H.1.1: Bir hizmetin tüm slotları (başlangıç saatine göre). */
    List<AppointmentSlot> findByServiceOfferingIdOrderByStartTimeAsc(Long serviceOfferingId);

    /**
     * US-08H.1.1: Klasik zaman aralığı kesişim koşulu (mevcut.start &lt;
     * yeni.end VE mevcut.end &gt; yeni.start) — AYNI hizmet için, verilen
     * [startTime, endTime) aralığıyla kesişen slotları döner.
     */
    @Query("SELECT s FROM AppointmentSlot s WHERE s.serviceOfferingId = :serviceOfferingId "
            + "AND s.startTime < :endTime AND s.endTime > :startTime")
    List<AppointmentSlot> findOverlapping(
            @Param("serviceOfferingId") Long serviceOfferingId,
            @Param("startTime") OffsetDateTime startTime,
            @Param("endTime") OffsetDateTime endTime);
}
