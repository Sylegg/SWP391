package com.lemon.supershop.swp391fa25evdm.product.repository;

import com.lemon.supershop.swp391fa25evdm.category.model.entity.Category;
import com.lemon.supershop.swp391fa25evdm.product.model.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface ProductRepo extends JpaRepository<Product, Integer> {
    // Efficient query methods instead of findAll() + filtering
    List<Product> findByVinNumContainingIgnoreCase(String vinNum);
    List<Product> findByEngineNumContainingIgnoreCase(String engineNum);
    List<Product> findByNameContainingIgnoreCase(String name);
    List<Product> findByCategoryId(int id);
    
    // Find products by dealer category ID
    @Query("SELECT p FROM Product p WHERE p.dealerCategory.id = :dealerCategoryId")
    List<Product> findByDealerCategoryId(@Param("dealerCategoryId") int dealerCategoryId);
    
    // Find products by dealer ID
    @Query("SELECT p FROM Product p WHERE p.dealerCategory.dealer.id = :dealerId")
    List<Product> findByDealerId(@Param("dealerId") int dealerId);
    
    // Find available products (TEST_DRIVE status and not currently in use)
    @Query("SELECT p FROM Product p WHERE p.status = 'TEST_DRIVE' " +
           "AND p.id NOT IN :inUseProductIds")
    List<Product> findAvailableTestDriveProducts(@Param("inUseProductIds") List<Integer> inUseProductIds);
    
    // Find available products by category (TEST_DRIVE status and not in use)
    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId " +
           "AND p.status = 'TEST_DRIVE' " +
           "AND p.id NOT IN :inUseProductIds")
    List<Product> findAvailableTestDriveProductsByCategory(
        @Param("categoryId") int categoryId,
        @Param("inUseProductIds") List<Integer> inUseProductIds);
    
    // Find available products by dealer category (TEST_DRIVE status and not in use)
    @Query("SELECT p FROM Product p WHERE p.dealerCategory.id = :dealerCategoryId " +
           "AND p.status = 'TEST_DRIVE' " +
           "AND p.id NOT IN :inUseProductIds")
    List<Product> findAvailableTestDriveProductsByDealerCategory(
        @Param("dealerCategoryId") int dealerCategoryId,
        @Param("inUseProductIds") List<Integer> inUseProductIds);
}
