package com.digitalik.recruitment.repository;

import com.digitalik.recruitment.entity.HiringRequest;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HiringRequestRepository extends JpaRepository<HiringRequest, Long> {

    /** Bölüm 14.4: en yeni talep önce, {@code organizationUnitId} verilmezse tüm talepler. */
    List<HiringRequest> findAllByOrderByIdDesc();

    List<HiringRequest> findByOrganizationUnitIdOrderByIdDesc(Long organizationUnitId);
}
