package com.lemon.supershop.swp391fa25evdm.report.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 💰 DTO cho báo cáo doanh thu và lợi nhuận
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesReportRes {
    private double totalRevenue;      // Tổng doanh thu
    private double totalProfit;       // Tổng lợi nhuận
    private int totalOrders;          // Tổng số đơn hàng
    private double averageOrderValue; // Giá trị trung bình mỗi đơn
    private double profitMargin;      // Tỷ suất lợi nhuận (%)
}
