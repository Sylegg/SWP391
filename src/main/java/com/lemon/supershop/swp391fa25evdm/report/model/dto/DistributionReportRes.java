package com.lemon.supershop.swp391fa25evdm.report.model.dto;

/**
 * 🚗 DTO cho báo cáo phân phối và tồn kho
 */
public class DistributionReportRes {
    private int totalDistributed;   // Tổng xe đã phân phối
    private int totalInStock;       // Tổng xe tồn kho (ACTIVE)
    private int totalSold;          // Tổng xe đã bán (SOLD)
    private int totalInactive;      // Tổng xe không hoạt động (INACTIVE)
    private double distributionRate; // Tỷ lệ phân phối (%)

    public DistributionReportRes() {
    }

    public DistributionReportRes(int totalDistributed, int totalInStock, int totalSold, int totalInactive, double distributionRate) {
        this.totalDistributed = totalDistributed;
        this.totalInStock = totalInStock;
        this.totalSold = totalSold;
        this.totalInactive = totalInactive;
        this.distributionRate = distributionRate;
    }

    public int getTotalDistributed() {
        return totalDistributed;
    }

    public void setTotalDistributed(int totalDistributed) {
        this.totalDistributed = totalDistributed;
    }

    public int getTotalInStock() {
        return totalInStock;
    }

    public void setTotalInStock(int totalInStock) {
        this.totalInStock = totalInStock;
    }

    public int getTotalSold() {
        return totalSold;
    }

    public void setTotalSold(int totalSold) {
        this.totalSold = totalSold;
    }

    public int getTotalInactive() {
        return totalInactive;
    }

    public void setTotalInactive(int totalInactive) {
        this.totalInactive = totalInactive;
    }

    public double getDistributionRate() {
        return distributionRate;
    }

    public void setDistributionRate(double distributionRate) {
        this.distributionRate = distributionRate;
    }
}
