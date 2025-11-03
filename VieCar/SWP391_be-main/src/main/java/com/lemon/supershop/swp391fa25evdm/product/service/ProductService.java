package com.lemon.supershop.swp391fa25evdm.product.service;

import java.util.List;
import java.util.Optional;

import com.lemon.supershop.swp391fa25evdm.category.model.entity.DealerCategory;
import com.lemon.supershop.swp391fa25evdm.product.model.enums.ProductStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lemon.supershop.swp391fa25evdm.category.model.entity.Category;
import com.lemon.supershop.swp391fa25evdm.category.repository.CategoryRepository;
import com.lemon.supershop.swp391fa25evdm.category.repository.DealerCategoryRepository;
import com.lemon.supershop.swp391fa25evdm.product.model.dto.ProductReq;
import com.lemon.supershop.swp391fa25evdm.product.model.dto.ProductRes;
import com.lemon.supershop.swp391fa25evdm.product.model.entity.Product;
import com.lemon.supershop.swp391fa25evdm.product.repository.ProductRepo;

@Service
public class ProductService {

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private DealerCategoryRepository dealerCategoryRepository;

    public List<ProductRes> findAllProducts(){
        List<Product> products = productRepo.findAll();
        return products.stream().map(this::convertToRes).toList();
    }

    public ProductRes findProductById(int id){
        Optional<Product> productOpt = productRepo.findById(id);
        return productOpt.map(this::convertToRes).orElse(null);
    }

    public boolean deleteProductById(int id){
        Optional<Product> productOpt = productRepo.findById(id);
        if (productOpt.isPresent()) {
            productOpt.get().setStatus(ProductStatus.INACTIVE);
            return true;
        }
        return false;
    }

    public ProductRes createProduct (ProductReq productReq) {
        Product product = new Product();
        Product newProduct = convertReqToEntity(product, productReq);
        productRepo.save(newProduct);
        return convertToRes(newProduct);
    }

    public ProductRes updateProduct (int id, ProductReq productReq) {
        Optional<Product> existingProductOpt = productRepo.findById(id);
        if (existingProductOpt.isPresent()) {
            Product existingProduct = convertReqToEntity(existingProductOpt.get(), productReq);
            productRepo.save(existingProduct);
            return convertToRes(existingProduct);
        }
        return null;
    }

    public List<ProductRes> getProductByCategoryId(Integer categoryId){
        List<Product> products = productRepo.findByCategoryId(categoryId);
        return products.stream().map(this::convertToRes).toList();
    }

    public List<ProductRes> getProductByVinNum(String vinNum){
        List<Product> productOpt = productRepo.findByVinNumContainingIgnoreCase(vinNum);
        return productOpt.isEmpty() ? null : productOpt.stream().map(this::convertToRes).toList();
    }

    public List<ProductRes> getProductByName(String name){
        List<Product> productOpt = productRepo.findByNameContainingIgnoreCase(name);
        return productOpt.isEmpty() ? null : productOpt.stream().map(this::convertToRes).toList();
    }

    public List<ProductRes> getProductByEngineNum(String engineNum){
        List<Product> productOpt = productRepo.findByEngineNumContainingIgnoreCase(engineNum);
        return productOpt.isEmpty() ? null : productOpt.stream().map(this::convertToRes).toList();
    }
    
    public List<ProductRes> getProductByDealerCategoryId(int dealerCategoryId){
        List<Product> products = productRepo.findByDealerCategoryId(dealerCategoryId);
        return products.stream().map(this::convertToRes).toList();
    }

    public ProductRes convertToRes(Product product) {
        if (product != null) {
            ProductRes productRes = new ProductRes();
            productRes.setId(product.getId());
            if (product.getName() != null) {
                productRes.setName(product.getName());
            }
            if (product.getVinNum() != null) {
                productRes.setVinNum(product.getVinNum());
            }
            if (product.getEngineNum() != null) {
                productRes.setEngineNum(product.getEngineNum());
            }
            if (product.getColor() != null) {
                productRes.setColor(product.getColor());
            }
            if (product.getHp() > 0){
                productRes.setHp(product.getHp());
            }
            if (product.getRange() > 0){
                productRes.setRange(product.getRange());
            }
            if (product.getTorque() > 0) {
                productRes.setTorque(product.getTorque());
            }
            if (product.getBattery() > 0) {
                productRes.setBattery(product.getBattery());
            }

            if (product.getDescription() != null) {
                productRes.setDescription(product.getDescription());
            }
            if (product.getStatus() != null) {
                productRes.setStatus(product.getStatus());
            } else {
                productRes.setStatus(ProductStatus.INACTIVE);
            }
            if (product.getImage() != null) {
                productRes.setImage(product.getImage());
            }
            if (product.getManufacture_date() != null){
                productRes.setManufacture_date(product.getManufacture_date());
            }
            if (product.getStockInDate() != null) {
                productRes.setStockInDate(product.getStockInDate());
            }
            // ✅ Map dealer price to response.price for UI - MỖI XE CÓ GIÁ RIÊNG
            if (product.getDealerPrice() > 0) {
                productRes.setPrice(product.getDealerPrice());
                // Debug log để kiểm tra giá
                System.out.println("🔍 Product ID " + product.getId() + " (" + product.getName() + 
                                   ", Color: " + product.getColor() + "): DealerPrice = " + product.getDealerPrice());
            } else {
                // Fallback: nếu product chưa có giá riêng, lấy từ category basePrice
                if (product.getCategory() != null) {
                    long basePrice = product.getCategory().getBasePrice();
                    if (basePrice > 0) {
                        productRes.setPrice(basePrice);
                        System.out.println("⚠️ Product ID " + product.getId() + " không có dealerPrice, dùng basePrice: " + basePrice);
                    }
                }
            }
            if (product.getCategory() != null) {
                Optional<Category> category = categoryRepository.findById(product.getCategory().getId());
                if (category.isPresent()) {
                    productRes.setCategoryId(category.get().getId());
                    productRes.setSpecial(category.get().isSpecial());
                }
            }
            if (product.getDealerCategory() != null) {
                Optional<DealerCategory> category = dealerCategoryRepository.findById(product.getDealerCategory().getId());
                if (category.isPresent()) {
                    productRes.setDealerCategoryId(category.get().getId());
                }
            }
            return productRes;
        }
        return null;
    }

    // Convert ProductReq to Product entity using Repository
    public Product convertReqToEntity(Product product, ProductReq productReq) {
        if (product != null || productReq != null){
            if (productReq.getName() != null){
                product.setName(productReq.getName());
            }
            if (productReq.getVinNum() != null){
                product.setVinNum(productReq.getVinNum());
            }
            if (productReq.getEngineNum() != null){
                product.setEngineNum(productReq.getEngineNum());
            }
            if (productReq.getHp() > 0){
                product.setHp(productReq.getHp());
            }
            if (productReq.getRange() > 0){
                product.setRange(productReq.getRange());
            }
            if (productReq.getBattery() > 0) {
                product.setBattery(productReq.getBattery());
            }
            if (productReq.getTorque() > 0){
                product.setTorque(productReq.getTorque());
            }
            if (productReq.getColor() != null){
                product.setColor(productReq.getColor());
            }
            if (productReq.getDescription() != null){
                product.setDescription(productReq.getDescription());
            }
            if (productReq.getStatus() != null){
                product.setStatus(productReq.getStatus());
            }
            if (productReq.getImage() != null){
                product.setImage(productReq.getImage());
            }
            if (productReq.getManufacture_date() != null){
                product.setManufacture_date(productReq.getManufacture_date());
            }
            if (productReq.getStockInDate() != null) {
                product.setStockInDate(productReq.getStockInDate());
            }
            if (productReq.getDealerPrice() > 0){
                product.setDealerPrice(productReq.getDealerPrice());
            }
            if (productReq.getCategoryId() > 0){
                categoryRepository.findById(productReq.getCategoryId()).ifPresent(product::setCategory);
            }
            if (productReq.getDealerCategoryId() > 0){
                dealerCategoryRepository.findById(productReq.getDealerCategoryId()).ifPresent(product::setDealerCategory);
            }
            return product;
        }
        return null;
    }
}
