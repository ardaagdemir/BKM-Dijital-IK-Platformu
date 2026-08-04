package com.digitalik.core;

import static org.assertj.core.api.Assertions.assertThat;

import com.digitalik.core.config.JpaAuditingConfig;
import com.digitalik.core.entity.SampleEntity;
import com.digitalik.core.listener.AuditLogContextHolder;
import com.digitalik.core.repository.SampleEntityRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;

/**
 * US-01.2.1 kabul kriteri: "Yeni bir varlık bu taban sınıfı miras aldığında
 * alanlar otomatik doldurulur."
 *
 * <p>{@code AuditLogContextHolder} import edilir çünkü {@code BaseEntity}'ye
 * kayıtlı {@code AuditLogEntityListener} (US-01.3.1) her save işleminde tetiklenir.
 */
@DataJpaTest
@Import({JpaAuditingConfig.class, AuditLogContextHolder.class})
class BaseEntityAuditingTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private SampleEntityRepository repository;

    @Test
    void olusturmaSirasindaAuditAlanlariOtomatikDoldurulur() {
        SampleEntity saved = repository.save(new SampleEntity("Örnek Kayıt"));
        entityManager.flush();

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
        assertThat(saved.getCreatedBy()).isEqualTo("system");
        assertThat(saved.getUpdatedBy()).isEqualTo("system");
    }

    @Test
    void guncellemeSirasindaSadeceGuncellemeAlanlariDegisir() {
        SampleEntity saved = repository.save(new SampleEntity("İlk Ad"));
        entityManager.flush();
        entityManager.clear();

        var createdAtBefore = saved.getCreatedAt();
        var createdByBefore = saved.getCreatedBy();

        SampleEntity reloaded = repository.findById(saved.getId()).orElseThrow();
        reloaded.setName("Güncellenmiş Ad");
        repository.save(reloaded);
        entityManager.flush();
        entityManager.clear();

        SampleEntity afterUpdate = repository.findById(saved.getId()).orElseThrow();

        assertThat(afterUpdate.getCreatedAt()).isEqualTo(createdAtBefore);
        assertThat(afterUpdate.getCreatedBy()).isEqualTo(createdByBefore);
        assertThat(afterUpdate.getUpdatedAt()).isNotNull();
        assertThat(afterUpdate.getUpdatedBy()).isEqualTo("system");
    }
}
