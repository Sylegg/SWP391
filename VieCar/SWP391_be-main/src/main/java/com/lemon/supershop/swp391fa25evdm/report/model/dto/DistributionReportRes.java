package com.lemon.supershop.swp391fa25evdm.report.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 🚗 DTO cho báo cáo phân phối và tồn kho
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DistributionReportRes {
    private int totalDistributed;   // Tổng xe đã phân phối
    private int totalInStock;       // Tổng xe tồn kho (ACTIVE)
    private int totalSold;          // Tổng xe đã bán (SOLD)
    private int totalInactive;      // Tổng xe không hoạt động (INACTIVE)
    private double distributionRate; // Tỷ lệ phân phối (%)
}
