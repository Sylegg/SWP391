package com.lemon.supershop.swp391fa25evdm.product.model.entity;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.lemon.supershop.swp391fa25evdm.category.model.entity.Category;
import com.lemon.supershop.swp391fa25evdm.category.model.entity.DealerCategory;
import com.lemon.supershop.swp391fa25evdm.distribution.model.entity.Distribution;
import com.lemon.supershop.swp391fa25evdm.distribution.model.entity.DistributionItem;
import com.lemon.supershop.swp391fa25evdm.order.model.entity.Order;
import com.lemon.supershop.swp391fa25evdm.payment.model.entity.InstallmentPlan;
import com.lemon.supershop.swp391fa25evdm.preorder.model.entity.PreOrder;
import com.lemon.supershop.swp391fa25evdm.product.model.enums.ProductStatus;
import com.lemon.supershop.swp391fa25evdm.testdrive.model.entity.TestDrive;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "product")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "Id", columnDefinition = "BIGINT")
    private int id;

    @Column(name = "Name", columnDefinition = "VARCHAR(150)")
    private String name;

    @Column(name = "Vin", columnDefinition = "VARCHAR(100) UNIQUE")
    private String vinNum;

    @Column(name = "Engine", columnDefinition = "VARCHAR(100) UNIQUE")
    private String engineNum;

    @Column(name = "Manufacture", columnDefinition = "DATETIME2")
    private Date manufacture_date;

    @Column(name = "StockInDate", columnDefinition = "DATETIME2")
    private Date stockInDate;

    @Column(name = "Battery", columnDefinition = "DECIMAL")
    private double battery;

    @Column(name = "Range", columnDefinition = "INT")
    private int range;

    @Column(name = "HP", columnDefinition = "INT")
    private int hp;

    @Column(name = "Torque", columnDefinition = "INT")
    private int torque;

    @Column(name = "Color", columnDefinition = "NVARCHAR(20)")
    private String Color;

    @Column(name = "DealerPrice", columnDefinition = "BIGINT")
    private long dealerPrice;

    @Column(name = "ManufacturerPrice", columnDefinition = "BIGINT", updatable = false)
    private Long manufacturerPrice;


    @Column(name = "RetailPrice", columnDefinition = "BIGINT")
    private Long retailPrice;

    @Column(name = "Image", columnDefinition = "VARCHAR(MAX)")
    private String image;

    @Column(name = "Description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "Status", columnDefinition = "VARCHAR(20)")
    @Enumerated(EnumType.STRING)
    private ProductStatus status;

    @ManyToOne
    @JoinColumn(name = "CategoryId")
    @JsonIgnore
    private Category category;

    @ManyToOne
    @JoinColumn(name = "DealerCategoryId")
    @JsonIgnore
    private DealerCategory dealerCategory;

    @OneToOne(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private Order order;

    @OneToOne()
    @JoinColumn(name = "DistributionItemId")
    private DistributionItem distributionItem;

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<PreOrder> preOrders = new ArrayList<>();

    @OneToOne(mappedBy = "product")
    private InstallmentPlan installmentPlan;

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<TestDrive> testDrives;

    public Product() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public DealerCategory getDealerCategory() {
        return dealerCategory;
    }

    public void setDealerCategory(DealerCategory dealerCategory) {
        this.dealerCategory = dealerCategory;
    }

    public InstallmentPlan getInstallmentPlan() {
        return installmentPlan;
    }

    public void setInstallmentPlan(InstallmentPlan installmentPlan) {
        this.installmentPlan = installmentPlan;
    }

    public long getDealerPrice() {
        return dealerPrice;
    }

    public void setDealerPrice(long dealerPrice) {
        this.dealerPrice = dealerPrice;
    }

    public List<PreOrder> getPreOrders() {
        return preOrders;
    }

    public void setPreOrders(List<PreOrder> preOrders) {
        this.preOrders = preOrders;
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
        return Color;
    }

    public void setColor(String color) {
        Color = color;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public ProductStatus getStatus() {
        return status;
    }

    public void setStatus(ProductStatus status) {
        this.status = status;
    }

    public DistributionItem getDistributionItem() {
        return distributionItem;
    }

    public void setDistributionItem(DistributionItem distributionItem) {
        this.distributionItem = distributionItem;
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

    public List<TestDrive> getTestDrives() {
        return testDrives;
    }

    public void setTestDrives(List<TestDrive> testDrives) {
        this.testDrives = testDrives;
    }
}
