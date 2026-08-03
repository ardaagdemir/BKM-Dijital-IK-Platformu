package com.digitalik.payroll.entity;

import com.digitalik.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * US-08D.1.1: Temel bir ücret kalemi (maaş, kesinti, fazla mesai, ...) —
 * {@code organization.JobTitle}'daki AYNI minimal referans listesi
 * deseni. Kabul kriteri yalnızca "Kalem tanımı basit bir referans
 * listesidir" diyor — FR-1102'nin sabit, zengin ücret kalemi listesi
 * BİLİNÇLİ OLARAK bir enum'a dönüştürülmedi.
 *
 * <p>{@code type} SERBEST METİN — roadmap story metnindeki "(maaş,
 * kesinti)" ifadesi örnek değerlerdir, sabit bir tür kümesi İSTEMİYOR;
 * {@code training.Training.type}'daki (US-08A.1.1) AYNI gerekçe.
 */
@Entity
@Table(name = "payroll_items")
public class PayrollItem extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type;

    protected PayrollItem() {
        // JPA için
    }

    public PayrollItem(String name, String type) {
        this.name = name;
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public String getType() {
        return type;
    }

    public void update(String name, String type) {
        this.name = name;
        this.type = type;
    }
}
