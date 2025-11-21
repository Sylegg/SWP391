package com.lemon.supershop.swp391fa25evdm.category.service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lemon.supershop.swp391fa25evdm.category.model.dto.CategoryReq;
import com.lemon.supershop.swp391fa25evdm.category.model.dto.CategoryRes;
import com.lemon.supershop.swp391fa25evdm.category.model.entity.Category;
import com.lemon.supershop.swp391fa25evdm.category.repository.CategoryRepository;
import com.lemon.supershop.swp391fa25evdm.dealer.repository.DealerRepo;

@Service
@Transactional
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private DealerRepo dealerRepo;

    public List<CategoryRes> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return categories.stream().map(this::convertToRes).toList();
    }

    public List<CategoryRes> getCategoryByName(String name) {
        List<Category> categories = categoryRepository.findByNameContainingIgnoreCase(name);
        return categories.stream().map(this::convertToRes).toList();
    }

    public CategoryRes getCategoryById(Integer id) {
        if (id != null) {
            Optional<Category> categoryOpt = categoryRepository.findById(id);
            return categoryOpt.map(this::convertToRes).orElse(null);
        }
        return null;
    }

    public CategoryRes createCategory(CategoryReq dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Category data cannot be null");
        }
        
        // Check for duplicate name within the same dealer
        if (dto.getName() != null && dto.getDealerId() != null) {
            if (categoryRepository.existsByNameIgnoreCaseAndDealerId(dto.getName(), dto.getDealerId())) {
                throw new RuntimeException("Category with name '" + dto.getName() + "' already exists for this dealer");
            }
        } else if (dto.getName() != null && dto.getDealerId() == null) {
            // For system-wide categories (no dealerId), check globally
            if (categoryRepository.existsByNameIgnoreCase(dto.getName())) {
                throw new RuntimeException("Category with name '" + dto.getName() + "' already exists");
            }
        }
        
        Category category = convertToEntity(dto);
        categoryRepository.save(category);
        return convertToRes(category);
    }

    public CategoryRes updateCategory(int id, CategoryReq dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Category request cannot be null");
        }
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));

        // Check for duplicate name within the same dealer (exclude current category)
        if (dto.getName() != null && category.getDealer() != null) {
            Optional<Category> nameCheck = categoryRepository.findByNameIgnoreCaseAndDealerId(
                dto.getName(), category.getDealer().getId());
            if (nameCheck.isPresent() && !Objects.equals(nameCheck.get().getId(), id)) {
                throw new RuntimeException("Category with name '" + dto.getName() + "' already exists for this dealer");
            }
        } else if (dto.getName() != null && category.getDealer() == null) {
            // For system-wide categories (no dealer), check globally
            Optional<Category> nameCheck = categoryRepository.findByNameIgnoreCase(dto.getName());
            if (nameCheck.isPresent() && !Objects.equals(nameCheck.get().getId(), id)) {
                throw new RuntimeException("Category with name '" + dto.getName() + "' already exists");
            }
        }

        category.setName(dto.getName());
        // ✅ Set default brand "VinFast" if null or empty (for update)
        category.setBrand(dto.getBrand() != null && !dto.getBrand().trim().isEmpty() 
                         ? dto.getBrand() 
                         : "VinFast");
    // Removed: version/type
        category.setBasePrice(dto.getBasePrice() != null ? dto.getBasePrice() : category.getBasePrice());
        category.setWarranty(dto.getWarranty() != null ? dto.getWarranty() : category.getWarranty());
        category.setDescription(dto.getDescription());
        category.setStatus(dto.getStatus() != null ? dto.getStatus() : category.getStatus());
        // Handle null Boolean - keep existing value if null
        category.setSpecial(dto.isSpecial() != null ? dto.isSpecial() : category.isSpecial());
        Category updatedCategory = categoryRepository.save(category);
        return convertToRes(updatedCategory);
    }

    public boolean deleteCategory(Integer id) {
        Optional<Category> existingCategory = categoryRepository.findById(id);
        if (existingCategory.isPresent()) {
            categoryRepository.delete(existingCategory.get());
            return true;
        }
        return false;
    }

    public List<CategoryRes> getSpecialCategories() {
        List<Category> categories = categoryRepository.findByIsSpecialTrue();
        return categories.stream().map(this::convertToRes).toList();
    }

    public List<CategoryRes> getCategoriesWithWarrantyGreaterThan(Integer years) {
        if (years == null || years < 0) {
            throw new IllegalArgumentException("Warranty years must be a positive number");
        }
        List<Category> categories = categoryRepository.findByWarrantyGreaterThan(years);
        return categories.stream().map(this::convertToRes).toList();
    }

    public List<CategoryRes> getCategoriesByBrand(String brand) {
        if (brand == null || brand.trim().isEmpty()) {
            throw new IllegalArgumentException("Brand cannot be null or empty");
        }
        List<Category> categories = categoryRepository.findByBrandIgnoreCase(brand.trim());
        return categories.stream().map(this::convertToRes).toList();
    }

    public List<CategoryRes> getActiveCategories() {
        List<Category> categories = categoryRepository.findActiveCategories();
        return categories.stream().map(this::convertToRes).toList();
    }

    public List<CategoryRes> getCategoriesByDealerId(Integer dealerId) {
        if (dealerId == null || dealerId <= 0) {
            throw new IllegalArgumentException("Dealer ID must be a positive number");
        }
        List<Category> categories = categoryRepository.findByDealerId(dealerId);
        return categories.stream().map(this::convertToRes).toList();
    }

    // Helper methods for conversion
    private Category convertToEntity(CategoryReq dto) {
        Category category = new Category();

        category.setName(dto.getName());
        // ✅ Set default brand "VinFast" if null or empty
        category.setBrand(dto.getBrand() != null && !dto.getBrand().trim().isEmpty() 
                         ? dto.getBrand() 
                         : "VinFast");
    // Removed: version/type
        // Handle null Boolean - default to false if null
        category.setSpecial(dto.isSpecial() != null ? dto.isSpecial() : false);
        category.setBasePrice(dto.getBasePrice() != null ? dto.getBasePrice() : 0L);
        category.setWarranty(dto.getWarranty() != null ? dto.getWarranty() : 0);
        category.setDescription(dto.getDescription());
        category.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");
        
        // Set dealer if dealerId is provided
        if (dto.getDealerId() != null && dto.getDealerId() > 0) {
            dealerRepo.findById(dto.getDealerId()).ifPresent(category::setDealer);
        }
        
        return category;
    }

    public CategoryRes updateCategoryBasePrice(Integer id, Long newBasePrice) {
        if (id == null) {
            throw new IllegalArgumentException("Category ID cannot be null");
        }
        if (newBasePrice == null || newBasePrice < 0) {
            throw new IllegalArgumentException("Base price must be a positive number");
        }

        Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));

        existingCategory.setBasePrice(newBasePrice);
        Category updatedCategory = categoryRepository.save(existingCategory);
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
            // Removed: version/type mapping
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
            // Set dealerId if dealer exists
            if (category.getDealer() != null) {
                categoryRes.setDealerId(category.getDealer().getId());
            }
            return categoryRes;
        } else {
            return null;
        }
    }
}
