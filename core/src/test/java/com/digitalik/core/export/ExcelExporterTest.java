package com.digitalik.core.export;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.ByteArrayInputStream;
import java.util.List;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;

/** US-09.4.1: Merkezi Excel (XLSX) dışa aktarma bileşeninin gerçek, okunabilir bir çalışma kitabı ürettiğini doğrular. */
class ExcelExporterTest {

    private record Person(String name, Integer age) {
    }

    @Test
    void basliktanSonraSatirlarDogruHucrelereYazilir() throws Exception {
        List<Person> people = List.of(new Person("Ali", 30), new Person("Veli", 40));

        byte[] xlsx = ExcelExporter.export(
                new String[] {"isim", "yas"}, people, p -> new String[] {p.name(), String.valueOf(p.age())});

        try (XSSFWorkbook workbook = new XSSFWorkbook(new ByteArrayInputStream(xlsx))) {
            Sheet sheet = workbook.getSheetAt(0);
            Row header = sheet.getRow(0);
            assertThat(header.getCell(0).getStringCellValue()).isEqualTo("isim");
            assertThat(header.getCell(1).getStringCellValue()).isEqualTo("yas");

            Row row1 = sheet.getRow(1);
            assertThat(row1.getCell(0).getStringCellValue()).isEqualTo("Ali");
            assertThat(row1.getCell(1).getStringCellValue()).isEqualTo("30");

            Row row2 = sheet.getRow(2);
            assertThat(row2.getCell(0).getStringCellValue()).isEqualTo("Veli");
        }
    }
}
