package com.digitalik.core.export;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;

/** US-09.4.1: Merkezi CSV dışa aktarma bileşeninin başlık üretimi, satır eşleme ve RFC 4180 tırnaklaması. */
class CsvExporterTest {

    private record Person(String name, Integer age) {
    }

    @Test
    void basliktanSonraSatirlarDogruSirayaGonderilir() {
        List<Person> people = List.of(new Person("Ali", 30), new Person("Veli", 40));

        String csv = CsvExporter.export(
                new String[] {"isim", "yas"}, people, p -> new String[] {p.name(), String.valueOf(p.age())});

        assertThat(csv).isEqualTo("isim,yas\nAli,30\nVeli,40\n");
    }

    @Test
    void virgulIcerenAlanTirnaklanir() {
        List<Person> people = List.of(new Person("Doe, John", 25));

        String csv = CsvExporter.export(new String[] {"isim", "yas"}, people, p -> new String[] {p.name(), "25"});

        assertThat(csv).isEqualTo("isim,yas\n\"Doe, John\",25\n");
    }

    @Test
    void tirnakIcerenAlandaIcTirnaklarIkizlenir() {
        List<Person> people = List.of(new Person("\"Takma Ad\" Ali", 25));

        String csv = CsvExporter.export(new String[] {"isim", "yas"}, people, p -> new String[] {p.name(), "25"});

        assertThat(csv).isEqualTo("isim,yas\n\"\"\"Takma Ad\"\" Ali\",25\n");
    }

    @Test
    void bosListeIcinYalnizcaBaslikDoner() {
        String csv = CsvExporter.export(new String[] {"isim", "yas"}, List.of(), p -> new String[0]);

        assertThat(csv).isEqualTo("isim,yas\n");
    }
}
