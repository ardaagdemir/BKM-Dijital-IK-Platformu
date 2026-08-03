package com.digitalik.discipline.repository;

import com.digitalik.discipline.entity.DisciplinaryCase;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DisciplinaryCaseRepository extends JpaRepository<DisciplinaryCase, Long> {

    /** Bir çalışanın TÜM revizyonları (en yeni önce) — {@code DisciplinaryCaseService.listByEmployee} bunları kök sürece göre grupla. */
    List<DisciplinaryCase> findByEmployeeIdOrderByIdDesc(Long employeeId);

    /**
     * US-08C.1.3: {@code rootId} kök revizyonun id'sidir (bkz. {@code
     * DisciplinaryCase.rootCaseId}); bu sürece ait TÜM revizyonları (kök
     * dahil), en yeni önce döner — ilk eleman her zaman GÜNCEL durumdur.
     */
    @Query("SELECT d FROM DisciplinaryCase d WHERE d.id = :rootId OR d.caseId = :rootId ORDER BY d.id DESC")
    List<DisciplinaryCase> findRevisionsByRootId(@Param("rootId") Long rootId);
}
