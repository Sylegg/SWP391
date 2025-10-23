package com.lemon.supershop.swp391fa25evdm.category.model.entity;

// ❌ Xóa Distribution import - relationship đã xóa
// import com.lemon.supershop.swp391fa25evdm.distribution.model.entity.Distribution;
import com.lemon.supershop.swp391fa25evdm.policies.model.entity.Policy;
import com.lemon.supershop.swp391fa25evdm.product.model.entity.Product;
import com.lemon.supershop.swp391fa25evdm.promotion.model.entity.Promotion;
// ❌ Xóa unused import
// import com.lemon.supershop.swp391fa25evdm.testdrive.model.entity.TestDrive;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "category")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "Id", columnDefinition = "BIGINT")
    private int id;

    @Column(name = "Name", columnDefinition = "VARCHAR(150)")
    private String name;

    @Column(name = "Brand", columnDefinition = "VARCHAR(100)")
    private String brand;

    @Column(name = "Version", columnDefinition = "VARCHAR(50)")
    private String version;

    @Column(name = "Type", columnDefinition = "NVARCHAR(50)")
    private String type;

    @Column(name = "IsSpecial", columnDefinition = "VARCHAR(20)")
    private boolean isSpecial;

    @Column(name = "BasePrice", columnDefinition = "BIGINT")
    private long basePrice;

    @Column(name = "Warranty", columnDefinition = "INT")
    private int warranty;

    @Column(name = "Description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "Status", columnDefinition = "VARCHAR(20)")
    private String status;

    //relation
    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Product> products = new ArrayList<>();

    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<DealerCategory> dealerCategories = new ArrayList<>();

    // ❌ Xóa distributions - Distribution không còn category field
    // @OneToMany(mappedBy = "category", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    // private List<Distribution> distributions = new ArrayList<>();

    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Policy> policies = new ArrayList<>();

    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Promotion> promotions = new ArrayList<>();

    //cons-get-set
    public Category() {}

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
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

    public List<Product> getProducts() {
        return products;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public long getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(long basePrice) {
        this.basePrice = basePrice;
    }

    public int getWarranty() {
        return warranty;
    }

    public void setWarranty(int warranty) {
        this.warranty = warranty;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<DealerCategory> getDealerCategories() {
        return dealerCategories;
    }

    public void setDealerCategories(List<DealerCategory> dealerCategories) {
        this.dealerCategories = dealerCategories;
    }

    // ❌ Xóa distributions getter/setter
    // public List<Distribution> getDistributions() { return distributions; }
    // public void setDistributions(List<Distribution> distributions) { this.distributions = distributions; }

    public List<Policy> getPolicies() {
        return policies;
    }

    public void setPolicies(List<Policy> policies) {
        this.policies = policies;
    }

    public List<Promotion> getPromotions() {
        return promotions;
    }

    public void setPromotions(List<Promotion> promotions) {
        this.promotions = promotions;
    }

    public boolean isSpecial() {
        return isSpecial;
    }

    public void setSpecial(boolean special) {
        isSpecial = special;
    }
}
