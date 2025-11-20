package com.lemon.supershop.swp391fa25evdm.order.model.dto.response;

import com.lemon.supershop.swp391fa25evdm.contract.model.entity.Contract;

import java.util.Date;
import java.util.List;

public class OrderRes {
    private int orderId;
    private int dealerId;
    private String customerName;
    private String productName;
    private List<Contract> contracts;
    private long totalPrice;
    private String description;
    private String status;
    private Date orderDate;
    private Date deliveryDate;

    public OrderRes(){}

<<<<<<< HEAD
=======
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

>>>>>>> f80fcac20c192e521fe159a9f41c5d8b008885b9
    public int getOrderId() {
        return orderId;
    }

    public void setOrderId(int orderId) {
        this.orderId = orderId;
    }

    public int getDealerId() {
        return dealerId;
    }

    public void setDealerId(int dealerId) {
        this.dealerId = dealerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public List<Contract> getContracts() {
        return contracts;
    }

    public void setContracts(List<Contract> contracts) {
        this.contracts = contracts;
    }

    public long getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(long totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

<<<<<<< HEAD
    public void setStatus(String status) {
        this.status = status;
=======
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
>>>>>>> f80fcac20c192e521fe159a9f41c5d8b008885b9
    }
}
