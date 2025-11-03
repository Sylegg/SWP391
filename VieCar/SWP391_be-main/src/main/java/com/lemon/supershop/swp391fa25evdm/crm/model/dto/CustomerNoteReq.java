package com.lemon.supershop.swp391fa25evdm.crm.model.dto;

public class CustomerNoteReq {
    private int userId;
    private int dealerId;
    private String content;
    private String createdBy;
    
    public CustomerNoteReq() {
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
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public String getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
}
