package com.lemon.supershop.swp391fa25evdm.testdrive.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lemon.supershop.swp391fa25evdm.testdrive.model.entity.TestDriveFeedback;

@Repository
public interface TestDriveFeedbackRepository extends JpaRepository<TestDriveFeedback, Integer> {
    
    /**
     * Find all feedback for a specific test drive
     */
    @Query("SELECT f FROM TestDriveFeedback f WHERE f.testDrive.id = :testDriveId")
    List<TestDriveFeedback> findByTestDriveId(@Param("testDriveId") int testDriveId);
    
    /**
     * Find all feedback for a specific product (across all test drives)
     */
    @Query("SELECT f FROM TestDriveFeedback f WHERE f.testDrive.product.id = :productId ORDER BY f.createAt DESC")
    List<TestDriveFeedback> findByProductId(@Param("productId") int productId);
    
    /**
     * Find all feedback by a specific customer
     */
    @Query("SELECT f FROM TestDriveFeedback f WHERE f.testDrive.user.id = :userId ORDER BY f.createAt DESC")
    List<TestDriveFeedback> findByUserId(@Param("userId") int userId);
    
    /**
     * Get average rating for a product
     */
    @Query("SELECT AVG(f.rating) FROM TestDriveFeedback f WHERE f.testDrive.product.id = :productId")
    Double getAverageRatingByProductId(@Param("productId") int productId);
    
    /**
     * Get average rating by a specific user
     */
    @Query("SELECT AVG(f.rating) FROM TestDriveFeedback f WHERE f.testDrive.user.id = :userId")
    Double getAverageRatingByUserId(@Param("userId") int userId);
    
    /**
     * Check if feedback already exists for a test drive
     */
    @Query("SELECT COUNT(f) > 0 FROM TestDriveFeedback f WHERE f.testDrive.id = :testDriveId")
    boolean existsByTestDriveId(@Param("testDriveId") int testDriveId);
}
