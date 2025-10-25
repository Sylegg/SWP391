package com.lemon.supershop.swp391fa25evdm.distribution.model.entity;

import com.lemon.supershop.swp391fa25evdm.product.model.entity.Product;
import jakarta.persistence.*;

@Entity
@Table(name = "distribution_item")
public class DistributionItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id", columnDefinition = "BIGINT")
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DistributionId")
    private Distribution distribution;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ProductId")
    private Product product;

    @Column(name = "Color", columnDefinition = "NVARCHAR(20)")
    private String color;

    @Column(name = "Quantity", columnDefinition = "INT")
    private Integer quantity;

    public DistributionItem() {}

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Distribution getDistribution() {
        return distribution;
    }

    public void setDistribution(Distribution distribution) {
        this.distribution = distribution;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
