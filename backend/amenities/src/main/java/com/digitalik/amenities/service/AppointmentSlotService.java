package com.digitalik.amenities.service;

import com.digitalik.amenities.entity.AppointmentSlot;
import com.digitalik.amenities.exception.ServiceOfferingNotFoundException;
import com.digitalik.amenities.repository.AppointmentSlotRepository;
import com.digitalik.amenities.repository.ServiceOfferingRepository;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-08H.1.1: Slot tanımlama. Kabul kriteri: "Slot çakışması engellenir."
 */
@Service
public class AppointmentSlotService {

    private final AppointmentSlotRepository appointmentSlotRepository;
    private final ServiceOfferingRepository serviceOfferingRepository;

    public AppointmentSlotService(
            AppointmentSlotRepository appointmentSlotRepository, ServiceOfferingRepository serviceOfferingRepository) {
        this.appointmentSlotRepository = appointmentSlotRepository;
        this.serviceOfferingRepository = serviceOfferingRepository;
    }

    /**
     * AYNI hizmet için var olan herhangi bir slotla zaman aralığı KESİŞEN
     * bir slot reddedilir (bkz. {@code
     * AppointmentSlotRepository.findOverlapping}'in klasik kesişim
     * koşulu). Farklı hizmetlerin slotları birbiriyle asla çakışmaz —
     * çakışma yalnızca AYNI hizmet içinde anlamlı.
     */
    public AppointmentSlot create(Long serviceOfferingId, OffsetDateTime startTime, OffsetDateTime endTime) {
        if (serviceOfferingId == null) {
            throw new IllegalArgumentException("Hizmet boş olamaz.");
        }
        if (!serviceOfferingRepository.existsById(serviceOfferingId)) {
            throw new ServiceOfferingNotFoundException();
        }
        if (startTime == null || endTime == null) {
            throw new IllegalArgumentException("Başlangıç ve bitiş zamanı boş olamaz.");
        }
        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("Başlangıç zamanı bitiş zamanından önce olmalıdır.");
        }
        if (!appointmentSlotRepository.findOverlapping(serviceOfferingId, startTime, endTime).isEmpty()) {
            throw new IllegalArgumentException("Bu zaman aralığında çakışan bir slot zaten var.");
        }

        return appointmentSlotRepository.save(new AppointmentSlot(serviceOfferingId, startTime, endTime));
    }

    public List<AppointmentSlot> listByService(Long serviceOfferingId) {
        if (serviceOfferingId == null) {
            throw new IllegalArgumentException("Hizmet boş olamaz.");
        }
        return appointmentSlotRepository.findByServiceOfferingIdOrderByStartTimeAsc(serviceOfferingId);
    }
}
