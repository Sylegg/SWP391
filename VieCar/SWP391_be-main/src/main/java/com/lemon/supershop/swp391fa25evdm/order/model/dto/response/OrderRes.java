package com.lemon.supershop.swp391fa25evdm.order.model.dto.response;

import com.lemon.supershop.swp391fa25evdm.contract.model.entity.Contract;

import java.util.Date;
import java.util.List;

public class OrderRes {
    private int orderId;
    private int dealerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String customerAddress;
    private String productName;
    private String productImage;
    private String productVin;
    private String productEngine;
    private Double productBattery;
    private Integer productRange;
    private Integer productHP;
    private Integer productTorque;
    private String productColor;
    private List<Contract> contracts;
    private double totalPrice;
    private String status;
    private Date orderDate;
    private Date deliveryDate;
    private String notes;

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

    public void setContracts(List<Contract> contracts) {
        this.contracts = contracts;
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

    public List<Contract> getContracts() {
        return contracts;
    }

    public double getTotalPrice() {
        return totalPrice;
    }

    public String getStatus() {
        return status;
    }

    public Date getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(Date orderDate) {
        this.orderDate = orderDate;
    }

    public Date getDeliveryDate() {
        return deliveryDate;
    }

    public void setDeliveryDate(Date deliveryDate) {
        this.deliveryDate = deliveryDate;
    }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getCustomerAddress() { return customerAddress; }
    public void setCustomerAddress(String customerAddress) { this.customerAddress = customerAddress; }

    public String getProductVin() { return productVin; }
    public void setProductVin(String productVin) { this.productVin = productVin; }

    public String getProductEngine() { return productEngine; }
    public void setProductEngine(String productEngine) { this.productEngine = productEngine; }

    public Double getProductBattery() { return productBattery; }
    public void setProductBattery(Double productBattery) { this.productBattery = productBattery; }

    public Integer getProductRange() { return productRange; }
    public void setProductRange(Integer productRange) { this.productRange = productRange; }

    public Integer getProductHP() { return productHP; }
    public void setProductHP(Integer productHP) { this.productHP = productHP; }

    public Integer getProductTorque() { return productTorque; }
    public void setProductTorque(Integer productTorque) { this.productTorque = productTorque; }

    public String getProductColor() { return productColor; }
    public void setProductColor(String productColor) { this.productColor = productColor; }

    public String getProductImage() { return productImage; }
    public void setProductImage(String productImage) { this.productImage = productImage; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
