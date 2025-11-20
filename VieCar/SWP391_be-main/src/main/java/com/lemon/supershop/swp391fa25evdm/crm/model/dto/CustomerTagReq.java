package com.lemon.supershop.swp391fa25evdm.crm.model.dto;

public class CustomerTagReq {
    private int userId;
    private int dealerId;
    private String tag;
    private String color;
    
    public CustomerTagReq() {
    }
    
    public int getUserId() {
        return userId;
    }
    
    public void setUserId(int userId) {
        this.userId = userId;
    }
    
    public int getDealerId() {
        return dealerId;
    }
    
    public void setDealerId(int dealerId) {
        this.dealerId = dealerId;
    }
    
    public String getTag() {
        return tag;
    }
    
    public void setTag(String tag) {
        this.tag = tag;
    }
    
    public String getColor() {
        return color;
    }
    
    public void setColor(String color) {
        this.color = color;
    }
}
