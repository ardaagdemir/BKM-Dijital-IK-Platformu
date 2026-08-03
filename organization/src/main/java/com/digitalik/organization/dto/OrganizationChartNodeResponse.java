package com.digitalik.organization.dto;

import java.util.List;

public record OrganizationChartNodeResponse(
        Long id,
        String name,
        List<OrganizationChartEmployeeResponse> employees,
        List<OrganizationChartNodeResponse> children) {
}
