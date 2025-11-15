package com.lemon.supershop.swp391fa25evdm.crm.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lemon.supershop.swp391fa25evdm.crm.model.entity.CustomerTag;

@Repository
public interface CustomerTagRepository extends JpaRepository<CustomerTag, Integer> {
    
    // Find all tags for a customer
    @Query("SELECT ct FROM CustomerTag ct WHERE ct.user.id = :userId ORDER BY ct.createdAt DESC")
    List<CustomerTag> findByUserId(@Param("userId") int userId);
    
    // Find tags by customer and dealer
    @Query("SELECT ct FROM CustomerTag ct WHERE ct.user.id = :userId AND ct.dealer.id = :dealerId ORDER BY ct.createdAt DESC")
    List<CustomerTag> findByUserIdAndDealerId(@Param("userId") int userId, @Param("dealerId") int dealerId);
    
    // Find all tags created by a dealer
    @Query("SELECT ct FROM CustomerTag ct WHERE ct.dealer.id = :dealerId ORDER BY ct.createdAt DESC")
    List<CustomerTag> findByDealerId(@Param("dealerId") int dealerId);
    
    // Check if tag already exists for user
    @Query("SELECT COUNT(ct) > 0 FROM CustomerTag ct WHERE ct.user.id = :userId AND ct.dealer.id = :dealerId AND ct.tag = :tag")
    boolean existsByUserIdAndDealerIdAndTag(@Param("userId") int userId, @Param("dealerId") int dealerId, @Param("tag") String tag);
}
