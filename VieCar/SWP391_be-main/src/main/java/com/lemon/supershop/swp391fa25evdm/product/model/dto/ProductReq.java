package com.lemon.supershop.swp391fa25evdm.product.model.dto;

import java.sql.Date;

import com.lemon.supershop.swp391fa25evdm.product.model.enums.ProductStatus;

public class ProductReq {
    private String name;
    private String vinNum;
    private String engineNum;
    private double battery;
    private int range;
    private int hp;
    private int torque;
    private String color;
    private Date manufacture_date;
    // Ngày nhập kho (tùy chọn). Nếu không gửi, backend sẽ tự set khi hoàn tất phân phối
    private Date stockInDate;
    
    // Giá gốc từ hãng (chỉ set khi nhập kho lần đầu)
    private Long manufacturerPrice;
    
    // Giá bán lẻ của đại lý (có thể update)
    private Long retailPrice;
    
    private long dealerPrice; // @Deprecated - backward compatibility
    private String description;
    private ProductStatus status;
    private int categoryId;
    private int dealerCategoryId;
    private String image;

    public ProductReq() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getVinNum() {
        return vinNum;
    }

    public void setVinNum(String vinNum) {
        this.vinNum = vinNum;
    }

    public String getEngineNum() {
        return engineNum;
    }

    public void setEngineNum(String engineNum) {
        this.engineNum = engineNum;
    }

    public Date getManufacture_date() {
        return manufacture_date;
    }

    public void setManufacture_date(Date manufacture_date) {
        this.manufacture_date = manufacture_date;
    }

    public Date getStockInDate() {
        return stockInDate;
    }

    public void setStockInDate(Date stockInDate) {
        this.stockInDate = stockInDate;
    }

    public long getDealerPrice() {
        return dealerPrice;
    }

    public void setDealerPrice(long dealerPrice) {
        this.dealerPrice = dealerPrice;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ProductStatus getStatus() {
        return status;
    }

    public void setStatus(ProductStatus status) {
        this.status = status;
    }

    public int getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(int categoryId) {
        this.categoryId = categoryId;
    }

    public int getDealerCategoryId() {
        return dealerCategoryId;
    }

    public void setDealerCategoryId(int dealerCategoryId) {
        this.dealerCategoryId = dealerCategoryId;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public double getBattery() {
        return battery;
    }

    public void setBattery(double battery) {
        this.battery = battery;
    }

    public int getRange() {
        return range;
    }

    public void setRange(int range) {
        this.range = range;
    }

    public int getHp() {
        return hp;
    }

    public void setHp(int hp) {
        this.hp = hp;
    }

    public int getTorque() {
        return torque;
    }

    public void setTorque(int torque) {
        this.torque = torque;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Long getManufacturerPrice() {
        return manufacturerPrice;
    }

    public void setManufacturerPrice(Long manufacturerPrice) {
        this.manufacturerPrice = manufacturerPrice;
    }

    public Long getRetailPrice() {
        return retailPrice;
    }

    public void setRetailPrice(Long retailPrice) {
        this.retailPrice = retailPrice;
    }
}
