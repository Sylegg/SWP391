package com.lemon.supershop.swp391fa25evdm.report.model.dto;

/**
 * ⚡ DTO cho hiệu suất dealer
 */
public class DealerPerformanceRes {
    private int dealerId;
    private String dealerName;
    private String dealerAddress;
    private int totalSales;          // Tổng số đơn bán
    private double totalRevenue;     // Tổng doanh thu
    private double totalProfit;      // Tổng lợi nhuận
    private int totalProducts;       // Tổng số sản phẩm phân phối

    public DealerPerformanceRes() {
    }

    public DealerPerformanceRes(int dealerId, String dealerName, String dealerAddress, int totalSales, double totalRevenue, double totalProfit, int totalProducts) {
        this.dealerId = dealerId;
        this.dealerName = dealerName;
        this.dealerAddress = dealerAddress;
        this.totalSales = totalSales;
        this.totalRevenue = totalRevenue;
        this.totalProfit = totalProfit;
        this.totalProducts = totalProducts;
    }

    public int getDealerId() {
        return dealerId;
    }

    public void setDealerId(int dealerId) {
        this.dealerId = dealerId;
    }

    public String getDealerName() {
        return dealerName;
    }

    public void setDealerName(String dealerName) {
        this.dealerName = dealerName;
    }

    public String getDealerAddress() {
        return dealerAddress;
    }

    public void setDealerAddress(String dealerAddress) {
        this.dealerAddress = dealerAddress;
    }

    public int getTotalSales() {
        return totalSales;
    }

    public void setTotalSales(int totalSales) {
        this.totalSales = totalSales;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public double getTotalProfit() {
        return totalProfit;
    }

    public void setTotalProfit(double totalProfit) {
        this.totalProfit = totalProfit;
    }

    public int getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(int totalProducts) {
        this.totalProducts = totalProducts;
    }
}
