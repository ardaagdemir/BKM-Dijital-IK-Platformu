package com.digitalik.organization.repository;

import com.digitalik.organization.entity.JobTitle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobTitleRepository extends JpaRepository<JobTitle, Long> {
}
