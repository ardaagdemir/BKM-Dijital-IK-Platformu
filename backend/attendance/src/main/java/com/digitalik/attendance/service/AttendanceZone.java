package com.digitalik.attendance.service;

import java.time.ZoneId;

/**
 * US-07.2.2: PDKS'ten gelen {@code OffsetDateTime} değerleri, JPA/JDBC
 * katmanınca geri okunurken FARKLI bir offset'le dönebilir (aynı anı temsil
 * eder, ama {@code toLocalTime()}/{@code toLocalDate()} yanlış sonuç verir)
 * — bu yüzden ANI SABİT bu dilime çevirip ({@code atZoneSameInstant})
 * oradan yerel saat/tarih alınmalı. Bkz. {@code AttendanceDeviationService}
 * javadoc'undaki ayrıntılı gerekçe. BKM İstanbul merkezli olduğundan sabit
 * dilim olarak seçildi; başka bir dilim ihtiyacı ortaya çıkarsa buradan tek
 * noktadan değiştirilir.
 */
final class AttendanceZone {

    static final ZoneId REFERENCE = ZoneId.of("Europe/Istanbul");

    private AttendanceZone() {
    }
}
