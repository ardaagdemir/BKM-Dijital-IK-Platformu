package com.digitalik.core.export;

import java.util.Arrays;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * US-09.4.1: Merkezi CSV dışa aktarma bileşeni — {@code
 * payroll.PayrollExportService}'teki (US-08D.1.3) hand-rolled StringBuilder
 * deseninin genelleştirilmiş hali. O servisin AKSİNE (kapalı, tek
 * kullanımlık, bilinçli olarak tırnaklama YAPMAYAN bir CSV), bu bileşen
 * projenin GENEL dışa aktarma aracı olduğundan RFC 4180'in temel alan-
 * tırnaklama kuralını (virgül/tırnak/satır sonu içeren alanlar çift
 * tırnağa alınır, iç tırnaklar ikizlenir) uyguluyor — farklı modüllerin
 * farklı veri türlerini (isim, adres, açıklama metni) güvenle taşıyabilmesi
 * için.
 */
public final class CsvExporter {

    private CsvExporter() {
    }

    public static <T> String export(String[] header, List<T> rows, Function<T, String[]> rowMapper) {
        StringBuilder csv = new StringBuilder();
        appendRow(csv, header);
        for (T row : rows) {
            appendRow(csv, rowMapper.apply(row));
        }
        return csv.toString();
    }

    private static void appendRow(StringBuilder csv, String[] values) {
        csv.append(Arrays.stream(values).map(CsvExporter::escape).collect(Collectors.joining(","))).append('\n');
    }

    private static String escape(String value) {
        if (value == null) {
            return "";
        }
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return '"' + value.replace("\"", "\"\"") + '"';
        }
        return value;
    }
}
