package com.digitalik.recruitment.dto;

/**
 * US-05.4.2: {@code organization.Employee} kaydı oluşturmak için gereken,
 * adaydan türetilebilen alanların taslağı — {@code firstName}/{@code lastName}/{@code email}
 * dışındaki zorunlu alanlar ({@code nationalId}, {@code hireDate}, bkz.
 * {@code organization.CreateEmployeeRequest}) aday kaydında YOK; İK
 * kullanıcısı bunları elle tamamlayıp {@code POST /api/organization/employees}'i
 * AYRICA çağırmalı (kabul kriteri: "manuel tetiklemeli, tam otomatik senkron
 * değil").
 */
public record EmployeeDraftResponse(Long candidateId, String firstName, String lastName, String email) {
}
