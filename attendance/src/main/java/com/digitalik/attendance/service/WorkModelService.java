package com.digitalik.attendance.service;

import com.digitalik.attendance.entity.WorkModel;
import com.digitalik.attendance.exception.WorkModelNotFoundException;
import com.digitalik.attendance.repository.WorkModelRepository;
import java.time.LocalTime;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-07.1.1: Çalışma modeli referans listesi için CRUD —
 * {@code organization.JobTitleService}'teki AYNI desen.
 */
@Service
public class WorkModelService {

    private final WorkModelRepository workModelRepository;

    public WorkModelService(WorkModelRepository workModelRepository) {
        this.workModelRepository = workModelRepository;
    }

    public WorkModel create(String name, LocalTime plannedStartTime, LocalTime plannedEndTime) {
        assertValid(name, plannedStartTime, plannedEndTime);
        return workModelRepository.save(new WorkModel(name, plannedStartTime, plannedEndTime));
    }

    public List<WorkModel> getAll() {
        return workModelRepository.findAll();
    }

    public WorkModel update(Long id, String name, LocalTime plannedStartTime, LocalTime plannedEndTime) {
        assertValid(name, plannedStartTime, plannedEndTime);
        WorkModel workModel = workModelRepository.findById(id).orElseThrow(WorkModelNotFoundException::new);
        workModel.update(name, plannedStartTime, plannedEndTime);
        return workModelRepository.save(workModel);
    }

    public void delete(Long id) {
        if (!workModelRepository.existsById(id)) {
            throw new WorkModelNotFoundException();
        }
        workModelRepository.deleteById(id);
    }

    private void assertValid(String name, LocalTime plannedStartTime, LocalTime plannedEndTime) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Çalışma modeli adı boş olamaz.");
        }
        if (plannedStartTime == null || plannedEndTime == null) {
            throw new IllegalArgumentException("Planlanan başlangıç/bitiş saati boş olamaz.");
        }
        if (!plannedEndTime.isAfter(plannedStartTime)) {
            throw new IllegalArgumentException("Planlanan bitiş saati, başlangıç saatinden sonra olmalıdır.");
        }
    }
}
