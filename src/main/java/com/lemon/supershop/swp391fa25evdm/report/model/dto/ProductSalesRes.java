package com.lemon.supershop.swp391fa25evdm.report.model.dto;

/**
 * 🏆 DTO cho sản phẩm bán chạy
 */
public class ProductSalesRes {
    private String productName;
    private String categoryName;
    private int totalSold;           // Tổng số lượng bán
    private double totalRevenue;     // Tổng doanh thu từ sản phẩm
    private double averagePrice;     // Giá trung bình

    public ProductSalesRes() {
    }

    public ProductSalesRes(String productName, String categoryName, int totalSold, double totalRevenue, double averagePrice) {
        this.productName = productName;
        this.categoryName = categoryName;
        this.totalSold = totalSold;
        this.totalRevenue = totalRevenue;
        this.averagePrice = averagePrice;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public int getTotalSold() {
        return totalSold;
    }

    public void setTotalSold(int totalSold) {
        this.totalSold = totalSold;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public double getAveragePrice() {
        return averagePrice;
    }

    public void setAveragePrice(double averagePrice) {
        this.averagePrice = averagePrice;
    }
}
