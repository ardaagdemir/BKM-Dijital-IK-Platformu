package com.digitalik.recruitment.controller;

import com.digitalik.recruitment.dto.CandidateResponse;
import com.digitalik.recruitment.dto.CandidateStageRequest;
import com.digitalik.recruitment.dto.EmployeeDraftResponse;
import com.digitalik.recruitment.entity.Candidate;
import com.digitalik.recruitment.entity.CandidateStage;
import com.digitalik.recruitment.service.CandidateService;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * US-05.2.1: Aday başvurusu — "giriş yapmış İK kullanıcısından bağımsız bir
 * erişimdir" (kabul kriteri): bu uç {@code auth.SecurityConfig}'te
 * {@code permitAll()} ile kimlik doğrulamasından muaf tutulan, projedeki İLK
 * herkese açık yazma ucudur. CV, {@code multipart/form-data} ile ayrı bir
 * dosya olarak ({@code cv}) gönderilir; boyut sınırı ({@code bootstrap.application.yml}'deki
 * {@code spring.servlet.multipart.max-file-size}) herkese açık, kimliksiz bir
 * yazma ucuna karşı kaba bir kötüye kullanım önlemidir.
 *
 * <p>Tüm parametreler {@code required = false} — US-04.1.2'de keşfedilen
 * derste olduğu gibi, eksik bir zorunlu parametre Spring'in kendi
 * {@code MissingServletRequestParameterException}/{@code MissingServletRequestPartException}'ını
 * fırlatır ve bunlara özel bir handler olmadığından yanlışlıkla 500'e düşer;
 * boşluk/eksiklik yerine {@link CandidateService} içinde elle doğrulanıyor.
 *
 * <p>US-05.2.2: {@code PUT /{id}/stage} ile süreç aşaması güncellenir. Not
 * ekleme/listeleme AYRI bir {@code CandidateNoteController}'da — çoklu kayıt
 * bir alt kaynak (bkz. {@code organization.EmployeeAssetController}'daki
 * aynı ayrım gerekçesi). Rol kısıtlaması eklenmedi — kabul kriteri bundan
 * bahsetmiyor.
 *
 * <p>US-05.4.2: {@code POST /{id}/convert-to-employee} ile aday "dönüştürüldü"
 * olarak işaretlenir ve {@link EmployeeDraftResponse} (taslak) döner — bkz.
 * {@code Candidate.convertToEmployee()}'deki ayrıntılı not: gerçek
 * {@code organization.Employee} kaydı BURADA OLUŞTURULMAZ, İK kullanıcısı bu
 * taslakla {@code POST /api/organization/employees}'i AYRICA çağırmalı.
 *
 * <p><b>Bölüm 14.4 (frontend) sırasında bulunan boşluk:</b> bu sınıfın hiçbir
 * OKUMA ucu yoktu — {@code /recruitment/candidates} (liste) ve
 * {@code /recruitment/candidates/:id} (detay) ekranları backend'de KARŞILIĞI
 * OLMADAN geliştirilemezdi. {@code GET}/{@code GET /{id}}/{@code GET /{id}/cv}
 * eklendi; roadmap'in bu ekran için rol tablosu ({@code ADMIN}, {@code IK})
 * açık olduğundan — {@code applications}/{@code stage}/{@code convert-to-employee}'nin
 * AKSİNE (kabul kriterleri rol belirtmiyor) — bu YENİ uçlara
 * {@code @PreAuthorize} eklendi (bkz. {@code core.AuditLogController}'daki
 * aynı gerekçe: PII/CV içeren yeni bir okuma ucu, hassasiyeti nedeniyle).
 */
@RestController
@RequestMapping("/api/recruitment/candidates")
public class CandidateController {

    private final CandidateService candidateService;

    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }

    @PostMapping(path = "/applications", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CandidateResponse> apply(
            @RequestParam(required = false) String firstName,
            @RequestParam(required = false) String lastName,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String appliedPosition,
            @RequestPart(value = "cv", required = false) MultipartFile cv)
            throws IOException {
        byte[] cvData = cv != null ? cv.getBytes() : null;
        String cvFileName = cv != null ? cv.getOriginalFilename() : null;
        String cvContentType = cv != null ? cv.getContentType() : null;

        Candidate candidate =
                candidateService.apply(firstName, lastName, email, appliedPosition, cvFileName, cvContentType, cvData);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(candidate));
    }

    @PutMapping("/{id}/stage")
    public CandidateResponse changeStage(@PathVariable Long id, @RequestBody CandidateStageRequest request) {
        CandidateStage stage = parseStage(request.stage());
        return toResponse(candidateService.changeStage(id, stage));
    }

    @PostMapping("/{id}/convert-to-employee")
    public EmployeeDraftResponse convertToEmployee(@PathVariable Long id) {
        Candidate candidate = candidateService.convertToEmployee(id);
        return new EmployeeDraftResponse(
                candidate.getId(), candidate.getFirstName(), candidate.getLastName(), candidate.getEmail());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'IK')")
    public List<CandidateResponse> getAll() {
        return candidateService.getAll().stream().map(CandidateController::toResponse).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'IK')")
    public CandidateResponse getById(@PathVariable Long id) {
        return toResponse(candidateService.getById(id));
    }

    /** CV, veritabanında ham bayt olarak tutulur (bkz. {@code Candidate} javadoc'u) — burada olduğu gibi indirilir. */
    @GetMapping("/{id}/cv")
    @PreAuthorize("hasAnyRole('ADMIN', 'IK')")
    public ResponseEntity<byte[]> downloadCv(@PathVariable Long id) {
        Candidate candidate = candidateService.getById(id);
        String fileName = candidate.getCvFileName().replace("\"", "");
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(candidate.getCvContentType()))
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + fileName + "\"")
                .body(candidate.getCvData());
    }

    private static CandidateStage parseStage(String stage) {
        try {
            return CandidateStage.valueOf(stage);
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new IllegalArgumentException(
                    "Aşama yalnızca APPLICATION, INTERVIEW, OFFER, HIRED veya REJECTED olabilir.");
        }
    }

    private static CandidateResponse toResponse(Candidate candidate) {
        return new CandidateResponse(
                candidate.getId(),
                candidate.getFirstName(),
                candidate.getLastName(),
                candidate.getEmail(),
                candidate.getAppliedPosition(),
                candidate.getCvFileName(),
                candidate.getStage().name(),
                candidate.isConverted());
    }
}
