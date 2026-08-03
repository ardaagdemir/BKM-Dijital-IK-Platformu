package com.digitalik.organization.service;

import com.digitalik.organization.entity.EmployeeAsset;
import com.digitalik.organization.exception.EmployeeAssetNotFoundException;
import com.digitalik.organization.exception.EmployeeNotFoundException;
import com.digitalik.organization.repository.EmployeeAssetRepository;
import com.digitalik.organization.repository.EmployeeRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-03.3.2: Çalışana ait zimmet kayıtlarının (çoklu kalem) oluşturulması,
 * listelenmesi ve iade edilmesi.
 */
@Service
public class EmployeeAssetService {

    private final EmployeeAssetRepository employeeAssetRepository;
    private final EmployeeRepository employeeRepository;

    public EmployeeAssetService(EmployeeAssetRepository employeeAssetRepository, EmployeeRepository employeeRepository) {
        this.employeeAssetRepository = employeeAssetRepository;
        this.employeeRepository = employeeRepository;
    }

    public EmployeeAsset deliver(Long employeeId, String itemName, LocalDate deliveredAt) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new EmployeeNotFoundException();
        }
        if (itemName == null || itemName.isBlank()) {
            throw new IllegalArgumentException("Zimmet kalemi adı boş olamaz.");
        }
        if (deliveredAt == null) {
            throw new IllegalArgumentException("Teslim tarihi boş olamaz.");
        }

        return employeeAssetRepository.save(new EmployeeAsset(employeeId, itemName, deliveredAt));
    }

    public List<EmployeeAsset> listByEmployee(Long employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new EmployeeNotFoundException();
        }

        return employeeAssetRepository.findByEmployeeIdOrderByDeliveredAtDesc(employeeId);
    }

    public EmployeeAsset markReturned(Long employeeId, Long assetId, LocalDate returnedAt) {
        EmployeeAsset asset = employeeAssetRepository
                .findById(assetId)
                .filter(a -> a.getEmployeeId().equals(employeeId))
                .orElseThrow(EmployeeAssetNotFoundException::new);

        if (returnedAt == null) {
            throw new IllegalArgumentException("İade tarihi boş olamaz.");
        }
        if (asset.isReturned()) {
            throw new IllegalArgumentException("Bu zimmet kalemi zaten iade edilmiş.");
        }
        if (returnedAt.isBefore(asset.getDeliveredAt())) {
            throw new IllegalArgumentException("İade tarihi teslim tarihinden önce olamaz.");
        }

        asset.markReturned(returnedAt);
        return employeeAssetRepository.save(asset);
    }
}
