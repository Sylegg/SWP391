package com.lemon.supershop.swp391fa25evdm.category.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.lemon.supershop.swp391fa25evdm.dealer.model.entity.Dealer;
import com.lemon.supershop.swp391fa25evdm.policies.model.entity.Policy;
import com.lemon.supershop.swp391fa25evdm.product.model.entity.Product;
import com.lemon.supershop.swp391fa25evdm.promotion.model.entity.Promotion;
import com.lemon.supershop.swp391fa25evdm.testdrive.model.entity.TestDrive;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "dealerdategory")
public class DealerCategory {
    @Id
    @Column(name = "Id", columnDefinition = "VARCHAR(20)")
    private String id;

    @Column(name = "Name", nullable = false, columnDefinition = "NVARCHAR(150)")
    private String name;

    @Column(name = "Quantity", nullable = false, columnDefinition = "INT")
    private int quantity;

    @Column(name = "DealerPrice", nullable = false, columnDefinition = "DECIMAL(15,2)")
    private double dealerPrice;

    @Column(name = "Description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "Status", nullable = false, columnDefinition = "VARCHAR(20)")
    private String status;

    @ManyToOne
    @JoinColumn(name = "CategoryId")
    @JsonIgnore
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RoleId")
    private Dealer dealer;

    @ManyToMany(mappedBy = "dealerCategories", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Product> products = new ArrayList<>();

    @OneToMany(mappedBy = "dealerCategory", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<TestDrive> testDrives;
}
