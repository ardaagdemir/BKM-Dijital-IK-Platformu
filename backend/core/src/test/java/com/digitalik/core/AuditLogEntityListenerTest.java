package com.digitalik.core;

import static org.assertj.core.api.Assertions.assertThat;

import com.digitalik.core.config.JpaAuditingConfig;
import com.digitalik.core.entity.AuditLogEntry;
import com.digitalik.core.entity.AuditOperation;
import com.digitalik.core.entity.SampleEntity;
import com.digitalik.core.listener.AuditLogContextHolder;
import com.digitalik.core.repository.AuditLogRepository;
import com.digitalik.core.repository.SampleEntityRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;

/**
 * US-01.3.1 kabul kriteri: "Create/update işlemlerinde tablo, kullanıcı+zaman+
 * varlık türü+varlık id+işlem tipi ile bir satır alır."
 */
@DataJpaTest
@Import({JpaAuditingConfig.class, AuditLogContextHolder.class})
class AuditLogEntityListenerTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private SampleEntityRepository sampleEntityRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Test
    void olusturmaIslemiAuditLogaBirSatirEkler() {
        SampleEntity saved = sampleEntityRepository.save(new SampleEntity("Örnek Kayıt"));
        entityManager.flush();

        List<AuditLogEntry> entries = auditLogRepository.findByEntityTypeAndEntityId(
                "SampleEntity", String.valueOf(saved.getId()));

        assertThat(entries).hasSize(1);
        AuditLogEntry entry = entries.get(0);
        assertThat(entry.getOperation()).isEqualTo(AuditOperation.CREATE);
        assertThat(entry.getPerformedBy()).isEqualTo("system");
        assertThat(entry.getPerformedAt()).isNotNull();
    }

    @Test
    void guncellemeIslemiAuditLogaAyriBirSatirEkler() {
        SampleEntity saved = sampleEntityRepository.save(new SampleEntity("İlk Ad"));
        entityManager.flush();
        entityManager.clear();

        SampleEntity reloaded = sampleEntityRepository.findById(saved.getId()).orElseThrow();
        reloaded.setName("Güncellenmiş Ad");
        sampleEntityRepository.save(reloaded);
        entityManager.flush();

        List<AuditLogEntry> entries = auditLogRepository.findByEntityTypeAndEntityId(
                "SampleEntity", String.valueOf(saved.getId()));

        assertThat(entries).hasSize(2);
        assertThat(entries).extracting(AuditLogEntry::getOperation)
                .containsExactlyInAnyOrder(AuditOperation.CREATE, AuditOperation.UPDATE);
    }
}
