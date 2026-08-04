package com.digitalik.organization.service;

import com.digitalik.organization.entity.JobTitle;
import com.digitalik.organization.exception.JobTitleNotFoundException;
import com.digitalik.organization.repository.JobTitleRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * US-03.1.2: Görev/Unvan referans listesi için CRUD. Organizasyon
 * birimlerinden kasıtlı olarak bağımsızdır (bkz. {@link JobTitle}).
 */
@Service
public class JobTitleService {

    private final JobTitleRepository jobTitleRepository;

    public JobTitleService(JobTitleRepository jobTitleRepository) {
        this.jobTitleRepository = jobTitleRepository;
    }

    public JobTitle create(String name) {
        assertNotBlank(name);
        return jobTitleRepository.save(new JobTitle(name));
    }

    public List<JobTitle> getAll() {
        return jobTitleRepository.findAll();
    }

    public JobTitle update(Long id, String name) {
        assertNotBlank(name);
        JobTitle jobTitle = jobTitleRepository.findById(id).orElseThrow(JobTitleNotFoundException::new);
        jobTitle.rename(name);
        return jobTitleRepository.save(jobTitle);
    }

    public void delete(Long id) {
        if (!jobTitleRepository.existsById(id)) {
            throw new JobTitleNotFoundException();
        }
        jobTitleRepository.deleteById(id);
    }

    private void assertNotBlank(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Unvan adı boş olamaz.");
        }
    }
}
