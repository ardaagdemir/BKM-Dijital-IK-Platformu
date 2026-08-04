package com.digitalik.core.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.data.web.config.EnableSpringDataWebSupport.PageSerializationMode;

/**
 * US-03.2.3: Sayfalanmış ({@code Page<T>}) sonuçlar döndüren uç noktalar için.
 * {@code Page}'i doğrudan JSON'a serileştirmek Spring Data tarafından "stabil
 * yapı garantisi yok" diye işaretlenir; {@code PageSerializationMode.VIA_DTO},
 * framework'ün kendi önerdiği, stabil {@code PagedModel} yapısına
 * ({@code content} + {@code page: {size, number, totalElements, totalPages}})
 * geçirir.
 */
@Configuration
@EnableSpringDataWebSupport(pageSerializationMode = PageSerializationMode.VIA_DTO)
public class WebConfig {
}
