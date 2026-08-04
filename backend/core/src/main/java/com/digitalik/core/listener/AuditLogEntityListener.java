package com.digitalik.core.listener;

import com.digitalik.core.entity.AuditLogEntry;
import com.digitalik.core.entity.AuditOperation;
import com.digitalik.core.entity.BaseEntity;
import com.digitalik.core.repository.AuditLogRepository;
import jakarta.persistence.PostPersist;
import jakarta.persistence.PostUpdate;
import java.time.Instant;
import org.springframework.data.domain.AuditorAware;

/**
 * US-01.3.1: {@link BaseEntity} alt sınıflarında oluşturma/güncelleme işlemi
 * gerçekleştiğinde {@code audit_log} tablosuna bir satır ekler.
 *
 * <p>Bu sınıf JPA sağlayıcısı (Hibernate) tarafından no-arg constructor ile
 * örneklenir, Spring bileşeni olarak değil; bu nedenle standart
 * {@code @Autowired} alan enjeksiyonu güvenilir değildir. Bağımlılıklar,
 * ihtiyaç anında {@link AuditLogContextHolder} üzerinden uygulama bağlamından
 * alınır.
 */
public class AuditLogEntityListener {

    @PostPersist
    public void onPostPersist(BaseEntity entity) {
        record(entity, AuditOperation.CREATE);
    }

    @PostUpdate
    public void onPostUpdate(BaseEntity entity) {
        record(entity, AuditOperation.UPDATE);
    }

    @SuppressWarnings("unchecked")
    private void record(BaseEntity entity, AuditOperation operation) {
        var context = AuditLogContextHolder.getContext();
        var auditLogRepository = context.getBean(AuditLogRepository.class);
        var auditorAware = (AuditorAware<String>) context.getBean(AuditorAware.class);

        String performedBy = auditorAware.getCurrentAuditor().orElse("system");
        auditLogRepository.save(new AuditLogEntry(
                entity.getClass().getSimpleName(),
                String.valueOf(entity.getId()),
                operation,
                performedBy,
                Instant.now()));
    }
}
