package com.digitalik.platform.approval.dto;

import java.util.List;

public record UpdateApprovalChainStepsRequest(List<String> orderedRequiredRoles) {
}
