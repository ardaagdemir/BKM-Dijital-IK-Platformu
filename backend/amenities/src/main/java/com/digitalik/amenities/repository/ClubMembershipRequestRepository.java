package com.digitalik.amenities.repository;

import com.digitalik.amenities.entity.ClubMembershipRequest;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClubMembershipRequestRepository extends JpaRepository<ClubMembershipRequest, Long> {

    /** Bir çalışanın kendi üyelik talepleri (en yeni önce). */
    List<ClubMembershipRequest> findByEmployeeIdOrderByIdDesc(Long employeeId);

    /** İK için TÜM üyelik talepleri (en yeni önce) — karara bağlanacak talebi bulmak için. */
    List<ClubMembershipRequest> findAllByOrderByIdDesc();
}
