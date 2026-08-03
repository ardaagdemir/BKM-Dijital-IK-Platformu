package com.digitalik.organization.dto;

import java.time.LocalDate;

public record CreateEmployeeAssetRequest(String itemName, LocalDate deliveredAt) {
}
