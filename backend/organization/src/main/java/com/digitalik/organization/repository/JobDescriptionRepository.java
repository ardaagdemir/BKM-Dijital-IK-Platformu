package com.digitalik.organization.repository;

import com.digitalik.organization.entity.JobDescription;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobDescriptionRepository extends JpaRepository<JobDescription, Long> {

    /** US-08I.1.2: Bir unvana bağlı görev tanımları (en yeni önce). */
    List<JobDescription> findByJobTitleIdOrderByIdDesc(Long jobTitleId);
}
