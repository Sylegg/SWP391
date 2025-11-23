package com.lemon.supershop.swp391fa25evdm.category.service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

import com.lemon.supershop.swp391fa25evdm.dealer.repository.DealerRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lemon.supershop.swp391fa25evdm.category.model.dto.CategoryReq;
import com.lemon.supershop.swp391fa25evdm.category.model.dto.CategoryRes;
import com.lemon.supershop.swp391fa25evdm.category.model.entity.Category;
import com.lemon.supershop.swp391fa25evdm.category.repository.CategoryRepo;

@Service
@Transactional
public class CategoryService {

    @Autowired
    private CategoryRepo categoryRepo;

    @Autowired
    private DealerRepo dealerRepo;

    public List<CategoryRes> getAllCategories() {
        List<Category> categories = categoryRepo.findAll();
        return categories.stream().map(this::convertToRes).toList();
    }

    public List<CategoryRes> getCategoryByName(String name) {
        List<Category> categories = categoryRepo.findByNameContainingIgnoreCase(name);
        return categories.stream().map(this::convertToRes).toList();
    }

    public CategoryRes getCategoryById(Integer id) {
        if (id != null) {
            Optional<Category> categoryOpt = categoryRepo.findById(id);
            return categoryOpt.map(this::convertToRes).orElse(null);
        }
        return null;
    }

    public CategoryRes createCategory(CategoryReq dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Category data cannot be null");
        }
        if (dto.getName() != null && dto.getDealerId() != null) {
            if (categoryRepo.existsByNameIgnoreCaseAndDealerId(dto.getName(), dto.getDealerId())) {
                throw new RuntimeException("Category with name '" + dto.getName() + "' already exists for this dealer");
            }
        } else if (dto.getName() != null && dto.getDealerId() == null) {
            // For system-wide categories (no dealerId), check globally
            if (categoryRepo.existsByNameIgnoreCase(dto.getName())) {
                throw new RuntimeException("Category with name '" + dto.getName() + "' already exists");
            }
        }
        Category category = convertToEntity(dto);
        categoryRepo.save(category);
        return convertToRes(category);
    }

    public CategoryRes updateCategory(int id, CategoryReq dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Category request cannot be null");
        }
        Category category = categoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));

        if (dto.getName() != null && category.getDealer() != null) {
            Optional<Category> nameCheck = categoryRepo.findByNameIgnoreCaseAndDealerId(
                    dto.getName(), category.getDealer().getId());
            if (nameCheck.isPresent() && !Objects.equals(nameCheck.get().getId(), id)) {
                throw new RuntimeException("Category with name '" + dto.getName() + "' already exists for this dealer");
            }
        } else if (dto.getName() != null && category.getDealer() == null) {
            // For system-wide categories (no dealer), check globally
            Optional<Category> nameCheck = categoryRepo.findByNameIgnoreCase(dto.getName());
            if (nameCheck.isPresent() && !Objects.equals(nameCheck.get().getId(), id)) {
                throw new RuntimeException("Category with name '" + dto.getName() + "' already exists");
            }
        }

        category.setName(dto.getName());
        category.setBrand(dto.getBrand() != null && !dto.getBrand().trim().isEmpty()
                ? dto.getBrand()
                : "VinFast");
//        category.setVersion(dto.getVersion());
//        category.setType(dto.getType());
        category.setBasePrice(dto.getBasePrice());
        category.setWarranty(dto.getWarranty());
        category.setDescription(dto.getDescription());
        category.setStatus(dto.getStatus());
        category.setSpecial(dto.isSpecial());
        Category updatedCategory = categoryRepo.save(category);
        return convertToRes(updatedCategory);
    }

    public boolean deleteCategory(Integer id) {
        Optional<Category> existingCategory = categoryRepo.findById(id);
        if (existingCategory.isPresent()) {
            categoryRepo.delete(existingCategory.get());
            return true;
        }
        return false;
    }

    public List<CategoryRes> getSpecialCategories() {
        List<Category> categories = categoryRepo.findByIsSpecialTrue();
        return categories.stream().map(this::convertToRes).toList();
    }

    public List<CategoryRes> getCategoriesWithWarrantyGreaterThan(Integer years) {
        if (years == null || years < 0) {
            throw new IllegalArgumentException("Warranty years must be a positive number");
        }
        List<Category> categories = categoryRepo.findByWarrantyGreaterThan(years);
        return categories.stream().map(this::convertToRes).toList();
    }

    public List<CategoryRes> getCategoriesByBrand(String brand) {
        if (brand == null || brand.trim().isEmpty()) {
            throw new IllegalArgumentException("Brand cannot be null or empty");
        }
        List<Category> categories = categoryRepo.findByBrandIgnoreCase(brand.trim());
        return categories.stream().map(this::convertToRes).toList();
    }

    public List<CategoryRes> getActiveCategories() {
        List<Category> categories = categoryRepo.findActiveCategories();
        return categories.stream().map(this::convertToRes).toList();
    }

    public List<CategoryRes> getCategoriesByDealerId(Integer dealerId) {
        if (dealerId == null || dealerId <= 0) {
            throw new IllegalArgumentException("Dealer ID must be a positive number");
        }
        List<Category> categories = categoryRepo.findByDealerId(dealerId);
        return categories.stream().map(this::convertToRes).toList();
    }

    // Helper methods for conversion
    private Category convertToEntity(CategoryReq dto) {
        Category category = new Category();

        category.setName(dto.getName());
        category.setBrand(dto.getBrand() != null && !dto.getBrand().trim().isEmpty()
                ? dto.getBrand()
                : "VinFast");
//        category.setVersion(dto.getVersion());
//        category.setType(dto.getType());
        category.setSpecial(dto.isSpecial());
        category.setBasePrice(dto.getBasePrice());
        category.setWarranty(dto.getWarranty());
        category.setDescription(dto.getDescription());
        category.setStatus(dto.getStatus());
        category.setSpecial(dto.isSpecial());
        return category;
    }

    public CategoryRes updateCategoryBasePrice(Integer id, Long newBasePrice) {
        if (id == null) {
            throw new IllegalArgumentException("Category ID cannot be null");
        }
        if (newBasePrice == null || newBasePrice < 0) {
            throw new IllegalArgumentException("Base price must be a positive number");
        }

        Category existingCategory = categoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));

        existingCategory.setBasePrice(newBasePrice);
        Category updatedCategory = categoryRepo.save(existingCategory);
        return convertToRes(updatedCategory);
    }

    private CategoryRes convertToRes(Category category) {
        if (category != null) {
            CategoryRes categoryRes = new CategoryRes();
            if (category.getId() > 0){
                categoryRes.setId(category.getId());
            }
            if (category.getName() != null) {
                categoryRes.setName(category.getName());
            }
            if (category.getBrand() != null) {
                categoryRes.setBrand(category.getBrand());
            }
//            if (category.getVersion() != null) {
//                categoryRes.setVersion(category.getVersion());
//            }
//            if (category.getType() != null) {
//                categoryRes.setType(category.getType());
//            }
            if (category.getBasePrice() > 0){
                categoryRes.setBasePrice(category.getBasePrice());
            }
            if (category.getWarranty() > 0){
                categoryRes.setWarranty(category.getWarranty());
            }
            if (category.getDescription() != null){
                categoryRes.setDescription(category.getDescription());
            }
            if (category.getStatus() != null){
                categoryRes.setStatus(category.getStatus());
            }
            return categoryRes;
        } else {
            return null;
        }
    }
}
