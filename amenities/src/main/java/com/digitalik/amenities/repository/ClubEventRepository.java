package com.digitalik.amenities.repository;

import com.digitalik.amenities.entity.ClubEvent;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClubEventRepository extends JpaRepository<ClubEvent, Long> {

    /** US-08G.1.2: Bir kulübün etkinlikleri (tarihe göre). */
    List<ClubEvent> findByClubIdOrderByDateAsc(Long clubId);
}
