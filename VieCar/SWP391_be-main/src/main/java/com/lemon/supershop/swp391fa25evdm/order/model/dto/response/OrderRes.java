package com.lemon.supershop.swp391fa25evdm.order.model.dto.response;

import java.util.List;

public class OrderRes {
    private int orderId;
    private int dealerId;
    private String customerName;
    private String productName;
    private int contractId;
    private double totalPrice;
    private String status;

    public OrderRes(){}

    public void setOrderId(int orderId) {
        this.orderId = orderId;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public void setTotalPrice(double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public void setContractId(int contractId) {
        this.contractId = contractId;
    }

    public void setDealerId(int dealerId) {
        this.dealerId = dealerId;
    }

    public int getOrderId() {
        return orderId;
    }

    public int getDealerId() {
        return dealerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getProductName() {
        return productName;
    }

    public int getContractId() {
        return contractId;
    }

    public double getTotalPrice() {
        return totalPrice;
    }

    public String getStatus() {
        return status;
    }
}
