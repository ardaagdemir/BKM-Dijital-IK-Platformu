package com.digitalik.amenities.service;

import com.digitalik.amenities.entity.ServiceOffering;
import com.digitalik.amenities.exception.ServiceOfferingNotFoundException;
import com.digitalik.amenities.repository.ServiceOfferingRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/** US-08H.1.1: Hizmet referans listesi için CRUD — {@code organization.JobTitleService}'teki AYNI desen. */
@Service
public class ServiceOfferingService {

    private final ServiceOfferingRepository serviceOfferingRepository;

    public ServiceOfferingService(ServiceOfferingRepository serviceOfferingRepository) {
        this.serviceOfferingRepository = serviceOfferingRepository;
    }

    public ServiceOffering create(String name) {
        assertNotBlank(name);
        return serviceOfferingRepository.save(new ServiceOffering(name));
    }

    public List<ServiceOffering> getAll() {
        return serviceOfferingRepository.findAll();
    }

    public ServiceOffering update(Long id, String name) {
        assertNotBlank(name);
        ServiceOffering serviceOffering =
                serviceOfferingRepository.findById(id).orElseThrow(ServiceOfferingNotFoundException::new);
        serviceOffering.rename(name);
        return serviceOfferingRepository.save(serviceOffering);
    }

    public void delete(Long id) {
        if (!serviceOfferingRepository.existsById(id)) {
            throw new ServiceOfferingNotFoundException();
        }
        serviceOfferingRepository.deleteById(id);
    }

    private void assertNotBlank(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Hizmet adı boş olamaz.");
        }
    }
}
