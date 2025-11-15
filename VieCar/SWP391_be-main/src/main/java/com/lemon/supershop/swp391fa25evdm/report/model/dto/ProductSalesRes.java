package com.lemon.supershop.swp391fa25evdm.report.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 🏆 DTO cho sản phẩm bán chạy
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductSalesRes {
    private String productName;
    private String categoryName;
    private int totalSold;           // Tổng số lượng bán
    private double totalRevenue;     // Tổng doanh thu từ sản phẩm
    private double averagePrice;     // Giá trung bình
}
