package com.digitalik.core.repository;

import com.digitalik.core.entity.SampleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SampleEntityRepository extends JpaRepository<SampleEntity, Long> {
}
