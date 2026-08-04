package com.digitalik.travel.service;

import com.digitalik.travel.entity.TravelRequest;
import com.digitalik.travel.repository.TravelRequestRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;

/** US-08B.1.1: Seyahat talebi oluşturma/listeleme — kabul kriteri yalnızca "Form kaydedilir" diyor, onay akışı yok. */
@Service
public class TravelRequestService {

    private final TravelRequestRepository travelRequestRepository;

    public TravelRequestService(TravelRequestRepository travelRequestRepository) {
        this.travelRequestRepository = travelRequestRepository;
    }

    public TravelRequest create(Long employeeId, String location, LocalDate startDate, LocalDate endDate, String purpose) {
        if (employeeId == null) {
            throw new IllegalArgumentException("Çalışan boş olamaz.");
        }
        if (location == null || location.isBlank()) {
            throw new IllegalArgumentException("Lokasyon boş olamaz.");
        }
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Tarih aralığı boş olamaz.");
        }
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("Bitiş tarihi başlangıç tarihinden önce olamaz.");
        }
        if (purpose == null || purpose.isBlank()) {
            throw new IllegalArgumentException("Amaç boş olamaz.");
        }

        return travelRequestRepository.save(new TravelRequest(employeeId, location, startDate, endDate, purpose));
    }

    /** Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor. */
    public List<TravelRequest> listByEmployee(Long employeeId) {
        if (employeeId == null) {
            throw new IllegalArgumentException("Çalışan boş olamaz.");
        }
        return travelRequestRepository.findByEmployeeIdOrderByStartDateDescIdDesc(employeeId);
    }
}
