package com.digitalik.core.export;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.List;
import java.util.function.Function;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

/**
 * US-09.4.1: Merkezi Excel (XLSX) dışa aktarma bileşeni — {@link
 * CsvExporter} ile AYNI imza ({@code header + rows + rowMapper}), yalnızca
 * çıktı formatı farklı. Apache POI, ücretsiz/açık kaynak bir Maven
 * bağımlılığı — harici bir servis DEĞİL.
 */
public final class ExcelExporter {

    private ExcelExporter() {
    }

    public static <T> byte[] export(String[] header, List<T> rows, Function<T, String[]> rowMapper) {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Veri");

            Row headerRow = sheet.createRow(0);
            for (int col = 0; col < header.length; col++) {
                headerRow.createCell(col).setCellValue(header[col]);
            }

            int rowIndex = 1;
            for (T item : rows) {
                Row row = sheet.createRow(rowIndex++);
                String[] values = rowMapper.apply(item);
                for (int col = 0; col < values.length; col++) {
                    row.createCell(col).setCellValue(values[col] == null ? "" : values[col]);
                }
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException ex) {
            throw new UncheckedIOException(ex);
        }
    }
}
