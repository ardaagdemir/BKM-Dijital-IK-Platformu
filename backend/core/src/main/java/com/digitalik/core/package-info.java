/**
 * Paylaşılan çekirdek: taban entity ({@link com.digitalik.core.entity}), repository
 * ({@link com.digitalik.core.repository}), audit yakalama ({@link com.digitalik.core.listener}),
 * yapılandırma ({@link com.digitalik.core.config}) ve platform geneli hata işleme
 * ({@link com.digitalik.core.exception}) katman bazlı alt paketlerde tutulur.
 *
 * <p>Bu, ayrı bir Maven modülüdür ({@code core/pom.xml}) ve hiçbir iş modülüne
 * bağımlı değildir — her iş modülü (ör. {@code auth}, ileride {@code organization},
 * {@code leave}, ...) buna bağımlıdır. Modüller arası sınır, bir test/sözleşme ile
 * değil, doğrudan Maven'in bağımlılık grafiğiyle korunur: bir modül, bağımlılık olarak
 * tanımlamadığı bir modülün sınıflarına derleme zamanında erişemez; bağımlı olsa bile
 * yalnızca o modülün {@code public} sınıflarını görebilir (bkz.
 * docs/02-solution-architecture.md ADR-002).
 */
package com.digitalik.core;
