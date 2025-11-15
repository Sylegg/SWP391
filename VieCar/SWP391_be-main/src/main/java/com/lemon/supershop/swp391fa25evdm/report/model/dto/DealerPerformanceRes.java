package com.lemon.supershop.swp391fa25evdm.report.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ⚡ DTO cho hiệu suất dealer
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DealerPerformanceRes {
    private int dealerId;
    private String dealerName;
    private String dealerAddress;
    private int totalSales;          // Tổng số đơn bán
    private double totalRevenue;     // Tổng doanh thu
    private double totalProfit;      // Tổng lợi nhuận
    private int totalProducts;       // Tổng số sản phẩm phân phối
}
