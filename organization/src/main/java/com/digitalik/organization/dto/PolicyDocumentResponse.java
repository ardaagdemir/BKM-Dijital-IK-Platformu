package com.digitalik.organization.dto;

public record PolicyDocumentResponse(
        Long id, String title, int version, String fileName, String status, Long previousVersionId) {
}
