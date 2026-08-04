package com.digitalik.core.notification;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

/**
 * US-09.3.1: {@code core.notification} altyapısının şablon motoru. Ağır bir
 * template engine (Thymeleaf/FreeMarker) yerine bilinçli olarak basit
 * {@code {{alan}}} yer-tutucu değişimi kullanılıyor — toplamda yalnızca
 * birkaç şablon olduğundan tam bir motor aşırı mühendislik olurdu.
 *
 * <p>Şablonlar {@code classpath:notification-templates/*.txt} altında,
 * Java string literal'ları yerine dosya olarak (dolayısıyla versiyonlanabilir,
 * kod değişikliği gerektirmeden düzenlenebilir) tutulur.
 */
@Service
public class NotificationTemplateService {

    public String render(String templateName, Map<String, String> placeholders) {
        String template = loadTemplate(templateName);
        String result = template;
        for (Map.Entry<String, String> entry : placeholders.entrySet()) {
            result = result.replace("{{" + entry.getKey() + "}}", entry.getValue());
        }
        return result;
    }

    private String loadTemplate(String templateName) {
        ClassPathResource resource = new ClassPathResource("notification-templates/" + templateName + ".txt");
        try (InputStream in = resource.getInputStream()) {
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException ex) {
            throw new IllegalStateException("Bildirim şablonu okunamadı: " + templateName, ex);
        }
    }
}
