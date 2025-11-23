package com.lemon.supershop.swp391fa25evdm.report.model.dto;

/**
 * 💰 DTO cho báo cáo doanh thu và lợi nhuận
 */
public class SalesReportRes {
    private double totalRevenue;      // Tổng doanh thu
    private double totalProfit;       // Tổng lợi nhuận
    private int totalOrders;          // Tổng số đơn hàng
    private double averageOrderValue; // Giá trị trung bình mỗi đơn
    private double profitMargin;      // Tỷ suất lợi nhuận (%)

    public SalesReportRes() {
    }

    public SalesReportRes(double totalRevenue, double totalProfit, int totalOrders, double averageOrderValue, double profitMargin) {
        this.totalRevenue = totalRevenue;
        this.totalProfit = totalProfit;
        this.totalOrders = totalOrders;
        this.averageOrderValue = averageOrderValue;
        this.profitMargin = profitMargin;
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

    public int getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(int totalOrders) {
        this.totalOrders = totalOrders;
    }

    public double getAverageOrderValue() {
        return averageOrderValue;
    }

    public void setAverageOrderValue(double averageOrderValue) {
        this.averageOrderValue = averageOrderValue;
    }

    public double getProfitMargin() {
        return profitMargin;
    }

    public void setProfitMargin(double profitMargin) {
        this.profitMargin = profitMargin;
    }
}
