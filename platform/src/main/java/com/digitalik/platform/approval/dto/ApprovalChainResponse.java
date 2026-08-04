package com.digitalik.platform.approval.dto;

import java.util.List;

public record ApprovalChainResponse(Long id, String name, List<ApprovalChainStepResponse> steps) {
}
