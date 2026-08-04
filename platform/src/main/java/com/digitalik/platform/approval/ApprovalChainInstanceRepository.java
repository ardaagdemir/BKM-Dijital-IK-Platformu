package com.digitalik.platform.approval;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ApprovalChainInstanceRepository extends JpaRepository<ApprovalChainInstance, Long> {
}
