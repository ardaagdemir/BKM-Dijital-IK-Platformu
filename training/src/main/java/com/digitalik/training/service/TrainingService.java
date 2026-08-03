package com.digitalik.training.service;

import com.digitalik.training.entity.Training;
import com.digitalik.training.exception.TrainingNotFoundException;
import com.digitalik.training.repository.TrainingRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-08A.1.1: Eğitim kataloğu için CRUD — {@code attendance.WorkModelService}'teki
 * AYNI desen.
 */
@Service
public class TrainingService {

    private final TrainingRepository trainingRepository;

    public TrainingService(TrainingRepository trainingRepository) {
        this.trainingRepository = trainingRepository;
    }

    public Training create(String name, String type, Integer durationHours, String provider) {
        assertValid(name, type, durationHours, provider);
        return trainingRepository.save(new Training(name, type, durationHours, provider));
    }

    public List<Training> getAll() {
        return trainingRepository.findAll();
    }

    public Training update(Long id, String name, String type, Integer durationHours, String provider) {
        assertValid(name, type, durationHours, provider);
        Training training = trainingRepository.findById(id).orElseThrow(TrainingNotFoundException::new);
        training.update(name, type, durationHours, provider);
        return trainingRepository.save(training);
    }

    public void delete(Long id) {
        if (!trainingRepository.existsById(id)) {
            throw new TrainingNotFoundException();
        }
        trainingRepository.deleteById(id);
    }

    private void assertValid(String name, String type, Integer durationHours, String provider) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Eğitim adı boş olamaz.");
        }
        if (type == null || type.isBlank()) {
            throw new IllegalArgumentException("Eğitim türü boş olamaz.");
        }
        if (durationHours == null || durationHours <= 0) {
            throw new IllegalArgumentException("Süre (saat) sıfırdan büyük olmalıdır.");
        }
        if (provider == null || provider.isBlank()) {
            throw new IllegalArgumentException("Sağlayıcı boş olamaz.");
        }
    }
}
