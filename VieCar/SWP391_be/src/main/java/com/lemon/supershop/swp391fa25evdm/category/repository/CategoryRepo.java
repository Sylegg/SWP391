package com.lemon.supershop.swp391fa25evdm.category.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lemon.supershop.swp391fa25evdm.category.model.entity.Category;

@Repository
public interface CategoryRepo extends JpaRepository<Category, Integer> {

    // Find by name (exact match)
    Optional<Category> findByNameIgnoreCase(String name);

    Optional<Category> findByNameIgnoreCaseAndDealerId(String name, Integer dealerId);

    // Find by name containing (partial match)
    List<Category> findByNameContainingIgnoreCase(String name);

    // Find by brand
    List<Category> findByBrandIgnoreCase(String brand);

    // Find by status
    List<Category> findByStatus(String status);

    // Find special categories
    List<Category> findByIsSpecialTrue();

    // Find by warranty greater than
    List<Category> findByWarrantyGreaterThan(Integer warranty);

    // Find by price range
    List<Category> findByBasePriceBetween(Double minPrice, Double maxPrice);

    //Check existence by name
    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndDealerId(String name, Integer dealerId);

    // Find active categories
    @Query("SELECT c FROM Category c WHERE c.status = 'ACTIVE' OR c.status = 'AVAILABLE'")
    List<Category> findActiveCategories();

    @Query("SELECT c FROM Category c WHERE c.dealer.id = :dealerId")
    List<Category> findByDealerId(@Param("dealerId") Integer dealerId);
}
