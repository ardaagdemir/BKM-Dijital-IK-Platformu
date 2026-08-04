package com.digitalik.payroll.controller;

import com.digitalik.payroll.service.BankPaymentFileService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-09.8.1: Onaylanmış bordro verisinden banka ödeme dosyası üretimi —
 * bkz. {@link BankPaymentFileService}'in javadoc'u. {@code /api/payroll/**}
 * altında olduğundan {@code auth.PayrollStepUpFilter}'ın (US-08D.1.4) 2FA
 * gereksinimi otomatik olarak buraya da uygulanır. Rol kısıtlaması
 * eklenmedi — {@code PayrollConsolidationController}'daki AYNI gerekçe
 * (kabul kriteri bundan bahsetmiyor).
 */
@RestController
@RequestMapping("/api/payroll/bank-payment-file")
public class BankPaymentFileController {

    private final BankPaymentFileService bankPaymentFileService;

    public BankPaymentFileController(BankPaymentFileService bankPaymentFileService) {
        this.bankPaymentFileService = bankPaymentFileService;
    }

    @GetMapping
    public ResponseEntity<String> generate(@RequestParam int year, @RequestParam int month) {
        String csv = bankPaymentFileService.generateCsv(year, month);
        String fileName = "banka-odeme-%d-%02d.csv".formatted(year, month);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv;charset=UTF-8"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(csv);
    }
}
