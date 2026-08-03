package com.digitalik.organization.controller;

import com.digitalik.organization.dto.JobTitleRequest;
import com.digitalik.organization.dto.JobTitleResponse;
import com.digitalik.organization.entity.JobTitle;
import com.digitalik.organization.service.JobTitleService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-03.1.2: Görev/Unvan referans listesi CRUD ekranı. Organizasyon
 * birimlerinden bağımsızdır (bkz. {@link JobTitle}); rol kısıtlaması
 * eklenmedi, gerekçe için {@code OrganizationUnitController}'daki nota bkz.
 */
@RestController
@RequestMapping("/api/organization/job-titles")
public class JobTitleController {

    private final JobTitleService jobTitleService;

    public JobTitleController(JobTitleService jobTitleService) {
        this.jobTitleService = jobTitleService;
    }

    @PostMapping
    public ResponseEntity<JobTitleResponse> create(@RequestBody JobTitleRequest request) {
        JobTitle jobTitle = jobTitleService.create(request.name());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(jobTitle));
    }

    @GetMapping
    public List<JobTitleResponse> getAll() {
        return jobTitleService.getAll().stream()
                .map(JobTitleController::toResponse)
                .toList();
    }

    @PutMapping("/{id}")
    public JobTitleResponse update(@PathVariable Long id, @RequestBody JobTitleRequest request) {
        return toResponse(jobTitleService.update(id, request.name()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        jobTitleService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private static JobTitleResponse toResponse(JobTitle jobTitle) {
        return new JobTitleResponse(jobTitle.getId(), jobTitle.getName());
    }
}
