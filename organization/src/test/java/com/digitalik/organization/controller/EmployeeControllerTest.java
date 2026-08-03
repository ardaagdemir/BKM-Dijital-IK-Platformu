package com.digitalik.organization.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.digitalik.organization.dto.AssignEmployeeRequest;
import com.digitalik.organization.dto.CreateEmployeeRequest;
import com.digitalik.organization.dto.CreateOrganizationUnitRequest;
import com.digitalik.organization.dto.EmployeeProfileRequest;
import com.digitalik.organization.dto.JobTitleRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

/**
 * US-03.2.1 kabul kriteri: "Zorunlu alanlar doğrulanır; TC No format
 * kontrolünden geçer; kayıt oluşturulur."
 *
 * <p>{@code 10000000146}, resmi T.C. Kimlik No kontrol basamağı algoritmasını
 * (bkz. {@code EmployeeService.isValidNationalId}) geçen, yaygın olarak
 * test amaçlı kullanılan bir format örneğidir — gerçek bir kimliğe ait değildir.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class EmployeeControllerTest {

    private static final String GECERLI_TC_NO = "10000000146";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void gecerliBilgilerleCalisanKaydiOlusturulur() throws Exception {
        mockMvc.perform(post("/api/organization/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateEmployeeRequest(
                                "Ahmet", "Yılmaz", GECERLI_TC_NO, LocalDate.of(2026, 1, 15), "ahmet@dijitalik.local"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.firstName").value("Ahmet"))
                .andExpect(jsonPath("$.lastName").value("Yılmaz"))
                .andExpect(jsonPath("$.nationalId").value(GECERLI_TC_NO))
                .andExpect(jsonPath("$.hireDate").value("2026-01-15"))
                .andExpect(jsonPath("$.email").value("ahmet@dijitalik.local"));
    }

    @Test
    void gecersizFormatliTcNoIleKayitOlusturulamazVe400Doner() throws Exception {
        mockMvc.perform(post("/api/organization/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateEmployeeRequest(
                                "Ahmet", "Yılmaz", "12345678901", LocalDate.of(2026, 1, 15), "ahmet@dijitalik.local"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Geçersiz istek"));
    }

    @Test
    void onBirHaneliOlmayanTcNoIleKayitOlusturulamazVe400Doner() throws Exception {
        mockMvc.perform(post("/api/organization/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateEmployeeRequest(
                                "Ahmet", "Yılmaz", "123", LocalDate.of(2026, 1, 15), "ahmet@dijitalik.local"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void bosAdIleKayitOlusturulamazVe400Doner() throws Exception {
        mockMvc.perform(post("/api/organization/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateEmployeeRequest(
                                "  ", "Yılmaz", GECERLI_TC_NO, LocalDate.of(2026, 1, 15), "ahmet@dijitalik.local"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void isTarihiOlmadanKayitOlusturulamazVe400Doner() throws Exception {
        mockMvc.perform(post("/api/organization/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateEmployeeRequest(
                                "Ahmet", "Yılmaz", GECERLI_TC_NO, null, "ahmet@dijitalik.local"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void ayniTcNoIleIkinciKayitOlusturulamazVe409Doner() throws Exception {
        mockMvc.perform(post("/api/organization/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateEmployeeRequest(
                                "Ahmet", "Yılmaz", GECERLI_TC_NO, LocalDate.of(2026, 1, 15), "ahmet@dijitalik.local"))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/organization/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateEmployeeRequest(
                                "Mehmet", "Demir", GECERLI_TC_NO, LocalDate.of(2026, 2, 1), "mehmet@dijitalik.local"))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.title").value("Çalışan zaten kayıtlı"));
    }

    /** US-03.2.2 kabul kriteri: "Çalışan kaydı bir birim+unvan ile ilişkilendirilir." */
    @Test
    void calisanBirimVeUnvanaAtanabilir() throws Exception {
        Long employeeId = calisanOlustur();
        Long unitId = birimOlustur("ABC Şirketi");
        Long jobTitleId = unvanOlustur("Yazılım Mühendisi");

        mockMvc.perform(put("/api/organization/employees/" + employeeId + "/assignment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AssignEmployeeRequest(unitId, jobTitleId))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.organizationUnitId").value(unitId))
                .andExpect(jsonPath("$.jobTitleId").value(jobTitleId));
    }

    /** US-03.2.2 kabul kriteri: "atama sonradan değiştirilebilir." */
    @Test
    void atamaSonradanDegistirilebilir() throws Exception {
        Long employeeId = calisanOlustur();
        Long unitId1 = birimOlustur("ABC Şirketi");
        Long jobTitleId1 = unvanOlustur("Yazılım Mühendisi");
        Long unitId2 = birimOlustur("XYZ Şirketi");
        Long jobTitleId2 = unvanOlustur("İK Uzmanı");

        mockMvc.perform(put("/api/organization/employees/" + employeeId + "/assignment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AssignEmployeeRequest(unitId1, jobTitleId1))))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/organization/employees/" + employeeId + "/assignment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AssignEmployeeRequest(unitId2, jobTitleId2))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.organizationUnitId").value(unitId2))
                .andExpect(jsonPath("$.jobTitleId").value(jobTitleId2));
    }

    @Test
    void olmayanCalisanaAtamaYapilamazVe404Doner() throws Exception {
        Long unitId = birimOlustur("ABC Şirketi");
        Long jobTitleId = unvanOlustur("Yazılım Mühendisi");

        mockMvc.perform(put("/api/organization/employees/999999/assignment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AssignEmployeeRequest(unitId, jobTitleId))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Çalışan bulunamadı"));
    }

    @Test
    void olmayanBirimeAtamaYapilamazVe404Doner() throws Exception {
        Long employeeId = calisanOlustur();
        Long jobTitleId = unvanOlustur("Yazılım Mühendisi");

        mockMvc.perform(put("/api/organization/employees/" + employeeId + "/assignment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AssignEmployeeRequest(999999L, jobTitleId))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Birim bulunamadı"));
    }

    @Test
    void olmayanUnvanaAtamaYapilamazVe404Doner() throws Exception {
        Long employeeId = calisanOlustur();
        Long unitId = birimOlustur("ABC Şirketi");

        mockMvc.perform(put("/api/organization/employees/" + employeeId + "/assignment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AssignEmployeeRequest(unitId, 999999L))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Unvan bulunamadı"));
    }

    /** US-03.2.3 kabul kriteri: "sayfalama desteklenir." */
    @Test
    void calisanlarSayfalanmisSekildeListelenir() throws Exception {
        calisanOlustur("Ahmet", "Yılmaz", "10000000146");
        calisanOlustur("Mehmet", "Demir", "12345678950");
        calisanOlustur("Ayşe", "Kaya", "11111111110");

        mockMvc.perform(get("/api/organization/employees").param("size", "2").param("page", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.page.totalElements").value(3))
                .andExpect(jsonPath("$.page.totalPages").value(2));
    }

    /** US-03.2.3 kabul kriteri: "isim ... göre filtrelemek." */
    @Test
    void isimeGoreFiltrelenir() throws Exception {
        calisanOlustur("Ahmet", "Yılmaz", "10000000146");
        calisanOlustur("Mehmet", "Demir", "12345678950");

        mockMvc.perform(get("/api/organization/employees").param("name", "mehmet"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].firstName").value("Mehmet"));
    }

    /** US-03.2.3 kabul kriteri: "birim ... göre filtrelemek." */
    @Test
    void birimeGoreFiltrelenir() throws Exception {
        Long unitId = birimOlustur("ABC Şirketi");
        Long jobTitleId = unvanOlustur("Yazılım Mühendisi");
        Long assignedEmployeeId = calisanOlustur("Ahmet", "Yılmaz", "10000000146");
        calisanOlustur("Mehmet", "Demir", "12345678950");

        mockMvc.perform(put("/api/organization/employees/" + assignedEmployeeId + "/assignment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AssignEmployeeRequest(unitId, jobTitleId))))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/organization/employees").param("organizationUnitId", unitId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].id").value(assignedEmployeeId));
    }

    /** US-03.2.3 kabul kriteri: "unvana göre filtrelemek." */
    @Test
    void unvanaGoreFiltrelenir() throws Exception {
        Long unitId = birimOlustur("ABC Şirketi");
        Long jobTitleId = unvanOlustur("Yazılım Mühendisi");
        Long assignedEmployeeId = calisanOlustur("Ahmet", "Yılmaz", "10000000146");
        calisanOlustur("Mehmet", "Demir", "12345678950");

        mockMvc.perform(put("/api/organization/employees/" + assignedEmployeeId + "/assignment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AssignEmployeeRequest(unitId, jobTitleId))))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/organization/employees").param("jobTitleId", jobTitleId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].id").value(assignedEmployeeId));
    }

    /** US-03.2.5 kabul kriteri: "Güncelleme formu mevcut verileri gösterir." */
    @Test
    void calisanDetayiGoruntulenebilir() throws Exception {
        Long employeeId = calisanOlustur("Ahmet", "Yılmaz", GECERLI_TC_NO);

        mockMvc.perform(get("/api/organization/employees/" + employeeId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(employeeId))
                .andExpect(jsonPath("$.firstName").value("Ahmet"))
                .andExpect(jsonPath("$.lastName").value("Yılmaz"))
                .andExpect(jsonPath("$.nationalId").value(GECERLI_TC_NO));
    }

    @Test
    void olmayanCalisanDetayiGoruntulenemezVe404Doner() throws Exception {
        mockMvc.perform(get("/api/organization/employees/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Çalışan bulunamadı"));
    }

    /** US-03.2.5 kabul kriteri: "kaydetme audit'e düşer" — bkz. BaseEntity, ek kod gerekmez. */
    @Test
    void calisanTemelBilgileriGuncellenebilir() throws Exception {
        Long employeeId = calisanOlustur("Ahmet", "Yılmaz", GECERLI_TC_NO);

        mockMvc.perform(put("/api/organization/employees/" + employeeId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateEmployeeRequest(
                                "Ahmet Can",
                                "Yılmazer",
                                GECERLI_TC_NO,
                                LocalDate.of(2026, 3, 1),
                                "ahmetcan@dijitalik.local"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Ahmet Can"))
                .andExpect(jsonPath("$.lastName").value("Yılmazer"))
                .andExpect(jsonPath("$.hireDate").value("2026-03-01"))
                .andExpect(jsonPath("$.email").value("ahmetcan@dijitalik.local"));

        mockMvc.perform(get("/api/organization/employees/" + employeeId))
                .andExpect(jsonPath("$.firstName").value("Ahmet Can"));
    }

    @Test
    void degismeyenTcNoIleGuncellemeCakismaSayilmaz() throws Exception {
        Long employeeId = calisanOlustur("Ahmet", "Yılmaz", GECERLI_TC_NO);

        mockMvc.perform(put("/api/organization/employees/" + employeeId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateEmployeeRequest(
                                "Ahmet",
                                "Yılmaz",
                                GECERLI_TC_NO,
                                LocalDate.of(2026, 1, 15),
                                "ahmet.yeni@dijitalik.local"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("ahmet.yeni@dijitalik.local"));
    }

    @Test
    void baskaCalisaninTcNoSuYlaGuncellenemezVe409Doner() throws Exception {
        calisanOlustur("Ahmet", "Yılmaz", GECERLI_TC_NO);
        Long employeeId2 = calisanOlustur("Mehmet", "Demir", "12345678950");

        mockMvc.perform(put("/api/organization/employees/" + employeeId2)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateEmployeeRequest(
                                "Mehmet", "Demir", GECERLI_TC_NO, LocalDate.of(2026, 1, 15), "mehmet@dijitalik.local"))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.title").value("Çalışan zaten kayıtlı"));
    }

    @Test
    void gecersizTcNoIleGuncellenemezVe400Doner() throws Exception {
        Long employeeId = calisanOlustur("Ahmet", "Yılmaz", GECERLI_TC_NO);

        mockMvc.perform(put("/api/organization/employees/" + employeeId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateEmployeeRequest(
                                "Ahmet", "Yılmaz", "12345678901", LocalDate.of(2026, 1, 15), "ahmet@dijitalik.local"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void olmayanCalisanGuncellenemezVe404Doner() throws Exception {
        mockMvc.perform(put("/api/organization/employees/999999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateEmployeeRequest(
                                "Ahmet", "Yılmaz", GECERLI_TC_NO, LocalDate.of(2026, 1, 15), "ahmet@dijitalik.local"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Çalışan bulunamadı"));
    }

    /** US-03.3.1 kabul kriteri: "Bu bilgiler ayrı bir sekme/form olarak eklenir ve güncellenebilir." */
    @Test
    void ozlukBilgileriOlusturulupGoruntulenebilir() throws Exception {
        Long employeeId = calisanOlustur();

        mockMvc.perform(put("/api/organization/employees/" + employeeId + "/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new EmployeeProfileRequest(
                                LocalDate.of(1995, 5, 20),
                                "İstanbul",
                                "Kadın",
                                "İstanbul",
                                "Kadıköy",
                                "Örnek Mah. Örnek Sk. No:1",
                                "Lisans",
                                "İstanbul Üniversitesi",
                                2017,
                                "İngilizce",
                                "İleri"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employeeId").value(employeeId))
                .andExpect(jsonPath("$.birthDate").value("1995-05-20"))
                .andExpect(jsonPath("$.city").value("İstanbul"))
                .andExpect(jsonPath("$.educationLevel").value("Lisans"))
                .andExpect(jsonPath("$.foreignLanguage").value("İngilizce"));

        mockMvc.perform(get("/api/organization/employees/" + employeeId + "/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.schoolName").value("İstanbul Üniversitesi"));
    }

    /** US-03.3.1 kabul kriteri: "güncellenebilir" — aynı uç, ikinci çağrıda mevcut kaydı günceller. */
    @Test
    void ozlukBilgileriTekrarCagrildigindaGuncellenir() throws Exception {
        Long employeeId = calisanOlustur();

        mockMvc.perform(put("/api/organization/employees/" + employeeId + "/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new EmployeeProfileRequest(
                                LocalDate.of(1995, 5, 20), "İstanbul", "Kadın", "İstanbul", "Kadıköy", "Adres 1",
                                "Lisans", "İstanbul Üniversitesi", 2017, "İngilizce", "İleri"))))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/organization/employees/" + employeeId + "/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new EmployeeProfileRequest(
                                LocalDate.of(1995, 5, 20), "İstanbul", "Kadın", "Ankara", "Çankaya", "Adres 2",
                                "Yüksek Lisans", "Ankara Üniversitesi", 2020, "Almanca", "Orta"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.city").value("Ankara"))
                .andExpect(jsonPath("$.educationLevel").value("Yüksek Lisans"))
                .andExpect(jsonPath("$.foreignLanguage").value("Almanca"));

        mockMvc.perform(get("/api/organization/employees/" + employeeId + "/profile"))
                .andExpect(jsonPath("$.city").value("Ankara"));
    }

    @Test
    void olmayanCalisaninOzlukBilgisiKaydedilemezVe404Doner() throws Exception {
        mockMvc.perform(put("/api/organization/employees/999999/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new EmployeeProfileRequest(
                                LocalDate.of(1995, 5, 20), "İstanbul", "Kadın", "İstanbul", "Kadıköy", "Adres",
                                "Lisans", "Üniversite", 2017, "İngilizce", "İleri"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Çalışan bulunamadı"));
    }

    @Test
    void henuzOlusturulmamisOzlukBilgisiGoruntulenemezVe404Doner() throws Exception {
        Long employeeId = calisanOlustur();

        mockMvc.perform(get("/api/organization/employees/" + employeeId + "/profile"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Özlük bilgisi bulunamadı"));
    }

    private Long calisanOlustur() throws Exception {
        return calisanOlustur("Ahmet", "Yılmaz", GECERLI_TC_NO);
    }

    private Long calisanOlustur(String firstName, String lastName, String nationalId) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/organization/employees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateEmployeeRequest(
                                firstName,
                                lastName,
                                nationalId,
                                LocalDate.of(2026, 1, 15),
                                firstName.toLowerCase() + "@dijitalik.local"))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    private Long birimOlustur(String name) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/organization/units")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateOrganizationUnitRequest(name, null))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    private Long unvanOlustur(String name) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/organization/job-titles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new JobTitleRequest(name))))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }
}
