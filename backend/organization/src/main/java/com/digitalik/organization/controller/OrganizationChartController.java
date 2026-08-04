package com.digitalik.organization.controller;

import com.digitalik.organization.dto.OrganizationChartNodeResponse;
import com.digitalik.organization.service.OrganizationChartService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * US-08I.1.3: Organizasyon şemasını görsel olarak görüntüleme (JSON ağaç
 * — "görsel" sunum, roadmap'te henüz frontend'i olmayan bu projede API
 * seviyesinde ağaç yapısı sağlamak anlamına geliyor; kabul kriteri
 * yalnızca şemanın "Bölüm 3'teki veriden türetilmesini" istiyor, belirli
 * bir görselleştirme teknolojisi değil). Rol kısıtlaması eklenmedi —
 * kabul kriteri bundan bahsetmiyor.
 */
@RestController
@RequestMapping("/api/organization/chart")
public class OrganizationChartController {

    private final OrganizationChartService organizationChartService;

    public OrganizationChartController(OrganizationChartService organizationChartService) {
        this.organizationChartService = organizationChartService;
    }

    @GetMapping
    public List<OrganizationChartNodeResponse> getChart() {
        return organizationChartService.buildChart();
    }
}
