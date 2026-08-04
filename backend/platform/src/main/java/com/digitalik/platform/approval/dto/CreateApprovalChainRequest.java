package com.digitalik.platform.approval.dto;

import java.util.List;

/** {@code orderedRequiredRoles}: adım sırasına göre, her adımı onaylayabilecek rol. */
public record CreateApprovalChainRequest(String name, List<String> orderedRequiredRoles) {
}
