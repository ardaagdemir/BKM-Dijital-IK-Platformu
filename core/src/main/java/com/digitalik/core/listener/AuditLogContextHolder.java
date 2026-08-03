package com.digitalik.core.listener;

import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

/**
 * JPA sağlayıcısı (Hibernate) {@link AuditLogEntityListener}'ı doğrudan
 * yansımayla (no-arg constructor) örneklediği için standart {@code @Autowired}
 * alan enjeksiyonu bu sınıfta güvenilir çalışmıyor. Bu tutucu, uygulama
 * bağlamına statik bir erişim noktası sağlayarak listener'ın ihtiyaç duyduğu
 * bean'leri (repository, auditor) çalışma zamanında almasını sağlar.
 */
@Component
public class AuditLogContextHolder implements ApplicationContextAware {

    private static ApplicationContext context;

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        context = applicationContext;
    }

    static ApplicationContext getContext() {
        return context;
    }
}
