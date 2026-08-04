package com.digitalik.organization.controller;

import com.digitalik.organization.dto.CreateJobDescriptionRequest;
import com.digitalik.organization.dto.JobDescriptionResponse;
import com.digitalik.organization.entity.JobDescription;
import com.digitalik.organization.service.JobDescriptionService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-08I.1.2: Unvan bazlı görev tanımı yazma/listeleme — kabul kriteri:
 * "Görev tanımı unvana bağlanır." Rol kısıtlaması eklenmedi — kabul
 * kriteri bundan bahsetmiyor.
 */
@RestController
@RequestMapping("/api/documents/job-descriptions")
public class JobDescriptionController {

    private final JobDescriptionService jobDescriptionService;

    public JobDescriptionController(JobDescriptionService jobDescriptionService) {
        this.jobDescriptionService = jobDescriptionService;
    }

    @PostMapping
    public ResponseEntity<JobDescriptionResponse> create(@RequestBody CreateJobDescriptionRequest request) {
        JobDescription jobDescription = jobDescriptionService.create(request.jobTitleId(), request.content());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(jobDescription));
    }

    @GetMapping
    public List<JobDescriptionResponse> list(@RequestParam(required = false) Long jobTitleId) {
        return jobDescriptionService.listByJobTitle(jobTitleId).stream()
                .map(JobDescriptionController::toResponse)
                .toList();
    }

    private static JobDescriptionResponse toResponse(JobDescription jobDescription) {
        return new JobDescriptionResponse(jobDescription.getId(), jobDescription.getJobTitleId(), jobDescription.getContent());
    }
}
