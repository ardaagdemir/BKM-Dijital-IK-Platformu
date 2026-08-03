package com.digitalik.organization.service;

import com.digitalik.organization.entity.JobDescription;
import com.digitalik.organization.repository.JobDescriptionRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/** US-08I.1.2: Unvan bazlı görev tanımı yazma/listeleme — kabul kriteri: "Görev tanımı unvana bağlanır." */
@Service
public class JobDescriptionService {

    private final JobDescriptionRepository jobDescriptionRepository;

    public JobDescriptionService(JobDescriptionRepository jobDescriptionRepository) {
        this.jobDescriptionRepository = jobDescriptionRepository;
    }

    public JobDescription create(Long jobTitleId, String content) {
        if (jobTitleId == null) {
            throw new IllegalArgumentException("Unvan boş olamaz.");
        }
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Görev tanımı boş olamaz.");
        }
        return jobDescriptionRepository.save(new JobDescription(jobTitleId, content));
    }

    /** Rol kısıtlaması eklenmedi — kabul kriteri bundan bahsetmiyor. */
    public List<JobDescription> listByJobTitle(Long jobTitleId) {
        if (jobTitleId == null) {
            throw new IllegalArgumentException("Unvan boş olamaz.");
        }
        return jobDescriptionRepository.findByJobTitleIdOrderByIdDesc(jobTitleId);
    }
}
