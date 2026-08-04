package com.digitalik.performance.service;

import com.digitalik.performance.entity.Goal;
import com.digitalik.performance.exception.GoalNotFoundException;
import com.digitalik.performance.repository.GoalRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-06.1.1: Hedef tanımlama (ad, ağırlık) — kabul kriteri: "Ağırlık toplamı
 * validasyona tabidir." Bu, DB seviyesinde bir CHECK kısıtı değil (tek bir
 * satır kendi başına doğrulayamaz), servis seviyesinde: yeni/güncellenen
 * ağırlık eklendiğinde TÜM hedeflerin toplamı 100'ü GEÇEMEZ.
 */
@Service
public class GoalService {

    private static final int MAX_TOTAL_WEIGHT = 100;

    private final GoalRepository goalRepository;

    public GoalService(GoalRepository goalRepository) {
        this.goalRepository = goalRepository;
    }

    public Goal create(String name, Integer weight) {
        assertValid(name, weight);
        assertTotalWeightNotExceeded(weight, null);

        return goalRepository.save(new Goal(name, weight));
    }

    public List<Goal> getAll() {
        return goalRepository.findAll();
    }

    public Goal update(Long id, String name, Integer weight) {
        Goal goal = goalRepository.findById(id).orElseThrow(GoalNotFoundException::new);

        assertValid(name, weight);
        assertTotalWeightNotExceeded(weight, id);

        goal.update(name, weight);
        return goalRepository.save(goal);
    }

    public void delete(Long id) {
        if (!goalRepository.existsById(id)) {
            throw new GoalNotFoundException();
        }
        goalRepository.deleteById(id);
    }

    private void assertValid(String name, Integer weight) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Hedef adı boş olamaz.");
        }
        if (weight == null || weight <= 0 || weight > MAX_TOTAL_WEIGHT) {
            throw new IllegalArgumentException("Ağırlık 1 ile 100 arasında olmalıdır.");
        }
    }

    private void assertTotalWeightNotExceeded(int newWeight, Long excludeId) {
        int existingTotal = goalRepository.findAll().stream()
                .filter(goal -> excludeId == null || !goal.getId().equals(excludeId))
                .mapToInt(Goal::getWeight)
                .sum();

        if (existingTotal + newWeight > MAX_TOTAL_WEIGHT) {
            throw new IllegalArgumentException(
                    "Hedeflerin ağırlık toplamı 100'ü geçemez (mevcut toplam: %d, eklenmek istenen: %d)."
                            .formatted(existingTotal, newWeight));
        }
    }
}
