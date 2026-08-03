package com.digitalik.performance.service;

import com.digitalik.performance.entity.Competency;
import com.digitalik.performance.exception.CompetencyNotFoundException;
import com.digitalik.performance.repository.CompetencyRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-06.1.1: Yetkinlik tanımlama (ad, ağırlık) — bkz. {@code GoalService}'teki
 * aynı gerekçe (ağırlık toplamı doğrulaması). Yetkinliklerin ağırlık toplamı,
 * hedeflerinkinden AYRI bir 100'lük havuz — bkz. bu sınıfın javadoc'u.
 */
@Service
public class CompetencyService {

    private static final int MAX_TOTAL_WEIGHT = 100;

    private final CompetencyRepository competencyRepository;

    public CompetencyService(CompetencyRepository competencyRepository) {
        this.competencyRepository = competencyRepository;
    }

    public Competency create(String name, Integer weight) {
        assertValid(name, weight);
        assertTotalWeightNotExceeded(weight, null);

        return competencyRepository.save(new Competency(name, weight));
    }

    public List<Competency> getAll() {
        return competencyRepository.findAll();
    }

    public Competency update(Long id, String name, Integer weight) {
        Competency competency = competencyRepository.findById(id).orElseThrow(CompetencyNotFoundException::new);

        assertValid(name, weight);
        assertTotalWeightNotExceeded(weight, id);

        competency.update(name, weight);
        return competencyRepository.save(competency);
    }

    public void delete(Long id) {
        if (!competencyRepository.existsById(id)) {
            throw new CompetencyNotFoundException();
        }
        competencyRepository.deleteById(id);
    }

    private void assertValid(String name, Integer weight) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Yetkinlik adı boş olamaz.");
        }
        if (weight == null || weight <= 0 || weight > MAX_TOTAL_WEIGHT) {
            throw new IllegalArgumentException("Ağırlık 1 ile 100 arasında olmalıdır.");
        }
    }

    private void assertTotalWeightNotExceeded(int newWeight, Long excludeId) {
        int existingTotal = competencyRepository.findAll().stream()
                .filter(competency -> excludeId == null || !competency.getId().equals(excludeId))
                .mapToInt(Competency::getWeight)
                .sum();

        if (existingTotal + newWeight > MAX_TOTAL_WEIGHT) {
            throw new IllegalArgumentException(
                    "Yetkinliklerin ağırlık toplamı 100'ü geçemez (mevcut toplam: %d, eklenmek istenen: %d)."
                            .formatted(existingTotal, newWeight));
        }
    }
}
