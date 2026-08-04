package com.digitalik.recruitment.repository;

import com.digitalik.recruitment.entity.HiringRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HiringRequestRepository extends JpaRepository<HiringRequest, Long> {
}
